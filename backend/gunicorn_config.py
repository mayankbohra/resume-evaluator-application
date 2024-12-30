import multiprocessing
import os

# Gunicorn config
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 300
keepalive = 120
graceful_timeout = 120
max_requests = 1000
max_requests_jitter = 50
worker_connections = 1000

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process Naming
proc_name = "resume-analyzer"

# SSL (if needed)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Worker Initialization
def on_starting(server):
    """
    Called just before the master process is initialized.
    """
    pass

def on_exit(server):
    """
    Called just before exiting.
    """
    pass

def worker_int(worker):
    """
    Called just after a worker exited on SIGINT or SIGQUIT.
    """
    worker.log.info("worker received INT or QUIT signal")

def worker_abort(worker):
    """
    Called when a worker received the SIGABRT signal.
    """
    worker.log.info("worker received ABORT signal")
