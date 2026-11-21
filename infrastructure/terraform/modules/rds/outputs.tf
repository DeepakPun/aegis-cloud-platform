output "db_endpoint" {
  description = "Connection endpoint (host:port) for the PostgreSQL instance"
  value       = aws_db_instance.this.endpoint
}

output "db_name" {
  description = "Name of the initial PostgreSQL database"
  value       = aws_db_instance.this.db_name
}
