package service

import (
	"bolg-api/config"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/image/draw"
)

type MediaService struct{}

func NewMediaService() *MediaService {
	return &MediaService{}
}

func (s *MediaService) List(folder, mimeType, search string, page, perPage int) ([]model.MediaAsset, int64, error) {
	var assets []model.MediaAsset
	var total int64

	query := database.DB.Model(&model.MediaAsset{})
	if folder != "" {
		query = query.Where("folder = ?", folder)
	}
	if mimeType != "" {
		query = query.Where("mime_type LIKE ?", mimeType+"%")
	}
	if search != "" {
		query = query.Where("original_name LIKE ? OR alt_text LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	err := query.Order("created_at DESC").
		Offset((page - 1) * perPage).Limit(perPage).
		Find(&assets).Error

	return assets, total, err
}

func (s *MediaService) GetByID(id uint) (*model.MediaAsset, error) {
	var asset model.MediaAsset
	err := database.DB.First(&asset, id).Error
	return &asset, err
}

func (s *MediaService) Upload(file *multipart.FileHeader, folder, altText string, userID uint) (*model.MediaAsset, error) {
	cfg := config.Get()

	// Validate file size
	if file.Size > cfg.Storage.MaxFileSize {
		return nil, fmt.Errorf("file size exceeds limit (%d bytes)", cfg.Storage.MaxFileSize)
	}

	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true, ".svg": true,
		".mp4": true, ".webm": true, ".mov": true,
	}
	if !allowedExts[ext] {
		return nil, fmt.Errorf("file type %s not allowed", ext)
	}

	// Generate filename
	filename := generateFilename(ext)

	// Create directory
	uploadDir := filepath.Join(cfg.Storage.LocalPath, folder)
	os.MkdirAll(uploadDir, 0755)

	// Save file
	dst := filepath.Join(uploadDir, filename)
	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()

	// Detect MIME type
	mimeType := file.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	// For images, decode + compress + resize; for others, copy directly
	var width, height int
	var thumbnailURL string
	var finalSize int64

	if strings.HasPrefix(mimeType, "image/") && !strings.Contains(mimeType, "svg") {
		// Process image: resize, compress original, generate thumbnail
		w, h, processed, procErr := processAndCompressImage(src, dst, folder, filename, cfg)
		if procErr == nil && processed {
			width = w
			height = h
			thumbFilename := "thumb_" + filename
			thumbnailURL = cfg.Storage.BaseURL + "/" + folder + "/" + thumbFilename
			if info, err := os.Stat(dst); err == nil {
				finalSize = info.Size()
			}
		} else {
			// Fallback: copy as-is
			out, cpErr := os.Create(dst)
			if cpErr != nil {
				return nil, cpErr
			}
			src.Seek(0, 0)
			if _, cpErr := io.Copy(out, src); cpErr != nil {
				out.Close()
				return nil, cpErr
			}
			out.Close()
			finalSize = file.Size
		}
	} else {
		out, err := os.Create(dst)
		if err != nil {
			return nil, err
		}
		if _, err := io.Copy(out, src); err != nil {
			out.Close()
			return nil, err
		}
		out.Close()
		finalSize = file.Size
	}

	// Build URL
	url := cfg.Storage.BaseURL + "/" + folder + "/" + filename

	if finalSize == 0 {
		finalSize = file.Size
	}

	// Save to database
	asset := model.MediaAsset{
		Filename:     filename,
		OriginalName: file.Filename,
		MimeType:     mimeType,
		FileSize:     finalSize,
		Width:        width,
		Height:       height,
		URL:          url,
		ThumbnailURL: thumbnailURL,
		AltText:      altText,
		Folder:       folder,
		UploadedBy:   &userID,
	}

	if err := database.DB.Create(&asset).Error; err != nil {
		os.Remove(dst)
		return nil, err
	}

	return &asset, nil
}

func (s *MediaService) Delete(id uint) error {
	var asset model.MediaAsset
	if err := database.DB.First(&asset, id).Error; err != nil {
		return err
	}

	// Delete file
	cfg := config.Get()
	filePath := filepath.Join(cfg.Storage.LocalPath, asset.Folder, asset.Filename)
	os.Remove(filePath)

	// Delete thumbnail if exists
	if asset.ThumbnailURL != "" {
		thumbPath := filepath.Join(cfg.Storage.LocalPath, asset.Folder, "thumb_"+asset.Filename)
		os.Remove(thumbPath)
	}

	// Delete DB record
	return database.DB.Delete(&asset).Error
}

// processAndCompressImage decodes the source image, resizes if too large,
// compresses the original to JPEG, and generates a thumbnail.
// Returns (width, height, processed, error).
func processAndCompressImage(src io.Reader, dstPath, folder, filename string, cfg *config.Config) (width, height int, processed bool, err error) {
	img, _, err := image.Decode(src)
	if err != nil {
		return 0, 0, false, err
	}

	bounds := img.Bounds()
	width = bounds.Dx()
	height = bounds.Dy()

	const maxWidth = 2048
	const maxHeight = 2048

	// Resize if larger than max
	var finalImg image.Image = img
	if width > maxWidth || height > maxHeight {
		var newW, newH int
		if width > height {
			newW = maxWidth
			newH = int(float64(height) * float64(maxWidth) / float64(width))
		} else {
			newH = maxHeight
			newW = int(float64(width) * float64(maxHeight) / float64(height))
		}
		resized := image.NewRGBA(image.Rect(0, 0, newW, newH))
		draw.BiLinear.Scale(resized, resized.Bounds(), img, bounds, draw.Over, nil)
		finalImg = resized
		width = newW
		height = newH
	}

	// Save compressed original (JPEG quality 85)
	outFile, err := os.Create(dstPath)
	if err != nil {
		return width, height, false, err
	}
	defer outFile.Close()
	jpeg.Encode(outFile, finalImg, &jpeg.Options{Quality: 85})

	// Generate thumbnail (max 300px)
	const thumbMax = 300
	if width > thumbMax || height > thumbMax {
		var tw, th int
		if width > height {
			tw = thumbMax
			th = int(float64(height) * float64(thumbMax) / float64(width))
		} else {
			th = thumbMax
			tw = int(float64(width) * float64(thumbMax) / float64(height))
		}
		thumb := image.NewRGBA(image.Rect(0, 0, tw, th))
		draw.BiLinear.Scale(thumb, thumb.Bounds(), finalImg, finalImg.Bounds(), draw.Over, nil)

		thumbPath := filepath.Join(cfg.Storage.LocalPath, folder, "thumb_"+filename)
		thumbFile, err := os.Create(thumbPath)
		if err == nil {
			defer thumbFile.Close()
			encodeThumbnail(thumbFile, thumb)
		}
	}

	return width, height, true, nil
}

func generateFilename(ext string) string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b) + ext
}

func encodeThumbnail(w io.Writer, img image.Image) {
	jpeg.Encode(w, img, &jpeg.Options{Quality: 80})
}
