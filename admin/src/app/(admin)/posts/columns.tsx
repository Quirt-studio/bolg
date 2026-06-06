"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Star, Upload, Download, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Post } from "@/lib/api/posts";

type TFunc = (key: string) => string;

interface ColumnActions {
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onSchedule: (id: string) => void;
}

export function getColumns(actions: ColumnActions, t: TFunc): ColumnDef<Post>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "title",
      accessorFn: (row) => row.translations?.en?.title || row.translations?.zh?.title || "",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("posts.column.title")} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium max-w-[300px] truncate">
            {row.original.translations?.en?.title || row.original.translations?.zh?.title || "—"}
          </span>
          {row.original.translations?.zh?.title && <Badge variant="outline" className="text-[10px] px-1 py-0">ZH</Badge>}
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("posts.column.category")} />,
      cell: ({ row }) => row.original.category
        ? <Badge variant="secondary">{row.original.category.name || row.original.category.slug}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "reading_time",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("posts.column.read")} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.reading_time || 0} {t("common.min")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("posts.column.status")} />,
      cell: ({ row }) => {
        const status = row.original.status;
        const colors: Record<string, string> = {
          published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
          draft: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
          archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };
        return (
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className={colors[status] || ""}>{status}</Badge>
            {status === "scheduled" && row.original.published_at && (
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(row.original.published_at), "MM/dd HH:mm")}
              </span>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("posts.column.date")} />,
      cell: ({ row }) => <span className="text-muted-foreground">{format(new Date(row.original.date || row.original.created_at), "MMM dd, yyyy")}</span>,
    },
    {
      accessorKey: "featured",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("posts.column.featured")} />,
      cell: ({ row }) => row.original.featured
        ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div role="button" tabIndex={0}
              className="group/button inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/posts/${row.original.id}`} className="flex items-center w-full">
                <Pencil className="mr-2 h-4 w-4" />{t("works.edit")}
              </Link>
            </DropdownMenuItem>
            {row.original.status !== "published" && (
              <DropdownMenuItem onClick={() => actions.onPublish(String(row.original.id))}>
                <Upload className="mr-2 h-4 w-4" />{t("common.publish")}
              </DropdownMenuItem>
            )}
            {row.original.status === "published" && (
              <DropdownMenuItem onClick={() => actions.onUnpublish(String(row.original.id))}>
                <Download className="mr-2 h-4 w-4" />{t("common.unpublish")}
              </DropdownMenuItem>
            )}
            {row.original.status !== "published" && (
              <DropdownMenuItem onClick={() => actions.onSchedule(String(row.original.id))}>
                <Clock className="mr-2 h-4 w-4" />{t("common.schedule")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => actions.onDelete(String(row.original.id))} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />{t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
