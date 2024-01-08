"use client";

import DocPopup from "@/src/components/layouts/doc-popup";
import { DataTablePagination } from "@/src/components/table/data-table-pagination";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { type OrderByState } from "@/src/features/orderBy/types";
import { cn } from "@/src/utils/tailwind";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnSizingState,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: LangfuseColumnDef<TData, TValue>[];
  data: AsyncTableData<TData[]>;
  pagination?: {
    pageCount: number;
    onChange: OnChangeFn<PaginationState>;
    state: PaginationState;
  };
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState>;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  orderBy?: OrderByState;
  setOrderBy?: (s: OrderByState) => void;
  help?: { description: string; href: string };
}

export interface AsyncTableData<T> {
  isLoading: boolean;
  isError: boolean;
  data?: T;
  error?: string;
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  pagination,
  rowSelection,
  setRowSelection,
  columnSizing,
  onColumnSizingChange,
  columnVisibility,
  onColumnVisibilityChange,
  help,
  orderBy,
  setOrderBy,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: data.data ?? [],
    columns,
    columnResizeMode: "onChange",
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: pagination !== undefined,
    pageCount: pagination?.pageCount ?? 0,
    onPaginationChange: pagination?.onChange,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: onColumnSizingChange,
    onColumnVisibilityChange: onColumnVisibilityChange,
    getRowId: (row, index) => {
      if ("id" in row && typeof row.id === "string") {
        return row.id;
      } else {
        return index.toString();
      }
    },
    state: {
      columnFilters,
      pagination: pagination?.state,
      columnSizing,
      columnVisibility,
      rowSelection,
    },
    manualFiltering: true,
  });

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table style={{ width: table.getCenterTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortingEnabled =
                      header.column.columnDef.enableSorting;
                    return header.column.getIsVisible() ? (
                      <TableHead
                        key={header.id}
                        className={cn(
                          sortingEnabled ? "cursor-pointer" : null,
                          "relative whitespace-nowrap p-2",
                        )}
                        style={{ width: header.getSize() }}
                        title={sortingEnabled ? "Sort by this column" : ""}
                        onPointerUp={(event) => {
                          if (
                            !setOrderBy ||
                            !header.column.columnDef.id ||
                            !sortingEnabled
                          ) {
                            return;
                          }

                          if (orderBy?.column === header.column.columnDef.id) {
                            setOrderBy({
                              column: header.column.columnDef.id,
                              order: orderBy.order === "ASC" ? "DESC" : "ASC",
                            });
                          } else {
                            setOrderBy({
                              column: header.column.columnDef.id,
                              order: "DESC",
                            });
                          }
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            <div className="select-none">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}

                              {orderBy?.column === header.column.columnDef.id
                                ? renderOrderingIndicator(orderBy)
                                : null}
                            </div>
                          </>
                        )}

                        <div
                          onDoubleClick={() => header.column.resetSize()}
                          title="Resize this column"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            event.currentTarget.setPointerCapture(
                              event.pointerId,
                            );
                            header.getResizeHandler()(event);
                          }}
                          onPointerUp={(event) => {
                            event.stopPropagation();
                            event.currentTarget.releasePointerCapture(
                              event.pointerId,
                            );
                          }}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 select-none",
                            header.column.getIsResizing()
                              ? "cursor-col-resize bg-blue-300"
                              : "cursor-grab",
                          )}
                        ></div>
                      </TableHead>
                    ) : null;
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {data.isLoading || !data.data ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="relative">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="overflow-hidden whitespace-nowrap px-2 py-1 text-xs first:pl-2"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div>
                      No results.{" "}
                      {help && (
                        <DocPopup
                          description={help.description}
                          href={help.href}
                          size="sm"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {pagination !== undefined ? <DataTablePagination table={table} /> : null}
    </>
  );
}

function renderOrderingIndicator(orderBy?: OrderByState) {
  if (!orderBy) return;
  if (orderBy.order === "ASC") return <span className="ml-1">▲</span>;
  else return <span className="ml-1">▼</span>;
}
