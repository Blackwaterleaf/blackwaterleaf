# External reference notes for database audit

- MySQL documentation explains that a composite index can serve queries filtering on all indexed columns or a leftmost prefix. Column order should therefore match the equality filters and sort sequence of the query. Source: https://dev.mysql.com/doc/en/multiple-column-indexes.html
- MySQL documentation defines referential actions. `NO ACTION` is equivalent to `RESTRICT` for InnoDB: a parent deletion is rejected when matching child rows exist. `CASCADE` automatically propagates deletion or updates; `SET NULL` requires a nullable child column. Source: https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html
- TiDB 8.5 documentation states that foreign keys are generally available beginning with TiDB 8.5. It also states that CHECK constraints are disabled by default unless `tidb_enable_check_constraint` is enabled. The staging database reports that variable as `OFF`; this is why media context rules are enforced server-side rather than by a new database CHECK constraint. Source: https://docs.pingcap.com/tidb/stable/constraints/

These sources are used only to support recommendations. The assessed runtime is TiDB `8.0.11-TiDB-v8.5.3-serverless`, so all proposed migration syntax must be verified against the target before application.
