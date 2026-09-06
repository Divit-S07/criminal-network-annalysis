import { useQuery, usePaginatedQuery } from "../lib/apollo";
import { USERS_QUERY } from "../queries/UsersPage.query";
import { useUpdateUserStatus } from "../queries/UsersPage.mutators";
import {
  useState,
  useMemo,
  useCallback,
  DragEvent,
  useRef,
} from "react";

import {
  Users,
  Mail,
  Shield,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ban,
  UserCheck,
  UserX,
} from "lucide-react";

import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { LIMIT_OPTIONS } from "../lib/constants";
import styles from "./UsersPage.module.scss";

const statusConfig = {
  active: {
    label: "Active",
    className: "badge--active",
    icon: UserCheck,
  },
  suspended: {
    label: "Suspended",
    className: "badge--warning",
    icon: Ban,
  },
  inactive: {
    label: "Inactive",
    className: "badge--muted",
    icon: UserX,
  },
};

const roleConfig = {
  owner: { label: "Owner", className: "badge--owner" },
  admin: { label: "Admin", className: "badge--admin" },
  member: { label: "Member", className: "badge--member" },
};

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "role", label: "Role" },
  { value: "lastActiveAt", label: "Last active" },
];

type SortKey = (typeof sortOptions)[number]["value"];

export default function UsersPage() {
  const [offset, setOffset] = useState(0);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filters = useMemo(
    () => ({
      search,
      status: statusFilter,
      role: roleFilter,
    }),
    [search, statusFilter, roleFilter]
  );

  const isFiltered = Boolean(search) || Boolean(statusFilter) || Boolean(roleFilter);

  const {
    data,
    loading,
    error,
  } = usePaginatedQuery(USERS_QUERY, {
    offset,
    limit,
    filters: filters,
    pollInterval: 0,
  });

  const users = data?.users ?? [];
  const total = data?.usersAggregate?.total ?? 0;

  const emit = useCallback(() => {
    setOffset(0);
  }, []);

  const pageCount = Math.ceil(total / limit);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (!e.dataTransfer.getData("application/graphql-client-folder")) return;
      fileRef.current?.click();
    },
    []
  );

  const handleFileChange = useCallback(() => {
    fileRef.current = null;
  }, []);

  const pageNumbers = useMemo(() => {
    const result: (number | "...")[] = [];
    const radius = 2;
    const last = pageCount - 1;

    for (let i = 0; i <= last; i++) {
      if (i === 0 || i === last || (i >= offset - radius && i <= offset + radius)) {
        result.push(i + 1);
      } else if (result[result.length - 1] !== "...") {
        result.push("...");
      }
    }
    return result;
  }, [pageCount, offset]);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setOffset(0);
  }, [sortKey]);

  const sortedUsers = useMemo(() => {
    const list = [...users];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * dir;
      }
      return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * dir;
    });
    return list;
  }, [users, sortKey, sortDir]);

  const updateUser = useUpdateUserStatus();
  const handleStatusChange = useCallback(
    async (id: string, next: "active" | "suspended" | "inactive") => {
      try {
        await updateUser({
          variables: { input: { id, status: next } },
          optimisticResponse: {
            updateUserStatus: { id, status: next, __typename: "User" },
          },
        });
        emit();
      } catch {}
    },
    [updateUser, emit]
  );

  const selectedStatus = statusFilter ?? "all";

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Users className="icon" size={20} />
          <div>
            <h1 className={styles.title}>People</h1>
            <p className={styles.subtitle}>
              {total} member{total !== 1 ? "s" : ""} across all workspaces
            </p>
          </div>
        </div>
        <Button label="Add person" variant="primary" icon={Mail} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Select
            label="Role"
            options={[{ value: "", label: "Any role" }, ...Object.entries(roleConfig).map(([v, { label }]) => ({ value: v, label }))]}
            value={roleFilter ?? ""}
            onChange={(next) => {
              setRoleFilter(next === "" ? null : next);
              emit();
            }}
            icon={Shield}
          />
          <Select
            label="Status"
            options={[
              { value: "", label: "Any status" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "inactive", label: "Inactive" },
            ]}
            value={statusFilter ?? ""}
            onChange={(next) => {
              setStatusFilter(next === "" ? null : next);
              emit();
            }}
            icon={UserCheck}
          />
          <Select
            label="Sort by"
            options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
            value={sortKey}
            onChange={(next) => {
              setSortKey(next as SortKey);
              setOffset(0);
            }}
            icon={Clock}
          />
          <Button
            label={sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            variant="ghost"
            icon={sortDir === "asc" ? ChevronRight : ChevronLeft}
            onClick={() => {
              setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
              setOffset(0);
            }}
          />
        </div>
        <div className={styles.toolbarRight}>
          <Select
            label="Per page"
            options={LIMIT_OPTIONS.map((o) => ({ value: String(o), label: `${o} / page` }))}
            value={String(limit)}
            onChange={(next) => {
              const parsed = Number(next);
              if (parsed && parsed !== limit) {
                setOffset(0);
              }
            }}
            icon={Users}
          />
          <span className={styles.resultCount}>
            {total} result{total !== 1 ? "s" : ""}
            {isFiltered && <span className={styles.filterTag}>filtered</span>}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          {loading && (
            <div className={styles.empty}>
              <Loader2 className="spinner" size={24} />
              <p>Loading people…</p>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className={styles.dropzone} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" multiple accept="application/graphql-client-folder" onChange={handleFileChange} hidden />
              <p>Drag a workspace export here, or click to browse</p>
            </div>
          )}

          {sortedUsers.map((user) => {
            const status = statusConfig[user.status as keyof typeof statusConfig] ?? statusConfig.inactive;
            const role = roleConfig[user.role as keyof typeof roleConfig] ?? roleConfig.member;
            return (
              <div key={user.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <Avatar className={styles.avatar}>
                    <AvatarFallback label={user.name} />
                  </Avatar>
                  <Badge className={role.className}>{role.label}</Badge>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.name}>{user.name}</h3>
                  <p className={styles.email}>
                    <Mail size={12} />
                    {user.email}
                  </p>
                </div>
                <div className={styles.cardFooter}>
                  <Badge className={styles.statusBadge}>
                    <status.icon size={10} />
                    {status.label}
                  </Badge>
                  <span className={styles.lastActive}>
                    <Clock size={12} />
                    {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never"}
                  </span>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleStatusChange(user.id, user.status === "active" ? "inactive" : "active")}
                  >
                    {user.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && !error && users.length > 0 && (
          <div className={styles.pagination}>
            <Button
              label="← Previous"
              variant="ghost"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            />
            <div className={styles.pageNumbers}>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageButton} ${p - 1 === offset ? styles.pageButtonActive : ""}`}
                    onClick={() => setOffset(p - 1)}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
            <Button
              label="Next →"
              variant="ghost"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
