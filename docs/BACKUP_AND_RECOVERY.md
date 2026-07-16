# Backup and recovery

Hisab ERP must not rely on browser storage for production records.

## Required controls

1. Enable Supabase point-in-time recovery for the production project when the plan supports it.
2. Run a daily encrypted logical backup with `pg_dump` to storage outside Supabase.
3. Retain daily backups for 35 days, monthly backups for 12 months, and annual financial snapshots according to the company's legal retention requirements.
4. Test a restore into a separate project at least quarterly.
5. Record each restore test as an audit/compliance event.

## Example

```bash
DATABASE_URL='postgresql://...' BACKUP_DIR='./backups' ./scripts/backup-postgres.sh
```

Never commit database URLs or backup archives to GitHub.
