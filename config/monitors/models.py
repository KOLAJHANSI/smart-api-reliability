from django.db import models

# Create your models here.

class APIMonitor(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    method = models.CharField(max_length=100)
    expected_status = models.IntegerField(default=200)
    timeout = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
class MonitorResult(models.Model):
    monitor = models.ForeignKey(APIMonitor,
                                on_delete = models.CASCADE,
                                related_name='results')
    status_code = models.IntegerField(null=True,blank=True)
    response_time = models.FloatField(null=True,blank=True)
    is_healthy = models.BooleanField(default=False)
    checked_at = models.DateTimeField(auto_now_add=True)
    
class Incident(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("RESOLVED", "Resolved"),
    ]

    monitor = models.ForeignKey(
        APIMonitor,
        on_delete=models.CASCADE,
        related_name="incidents"
    )

    incident_type = models.CharField(max_length=50)
    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.monitor.name} - {self.incident_type} - {self.status}"