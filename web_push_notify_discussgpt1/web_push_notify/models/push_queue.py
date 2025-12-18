import json
import logging
from odoo import models, fields, api

_logger = logging.getLogger(__name__)

class PushNotificationQueue(models.Model):
    _name = 'push.notification.queue'
    _description = 'Push Notification Queue'

    subscription_id = fields.Many2one('push.subscription', string='Subscription', required=True, ondelete='cascade')
    payload = fields.Text(string='Payload', required=True)
    state = fields.Selection([
        ('draft', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed')
    ], string='Status', default='draft', index=True)
    error_message = fields.Text(string='Error Message')
    retry_count = fields.Integer(string='Retry Count', default=0)

    @api.model
    def process_queue(self):
        """ Cron job to process pending notifications """
        # Process up to 100 notifications at a time to avoid timeouts
        pending_pushes = self.search([('state', '=', 'draft')], limit=100)
        
        for push in pending_pushes:
            try:
                # Parse payload
                payload_data = json.loads(push.payload)
                
                # Send
                push.subscription_id.send_notification(payload_data)
                
                # Success
                push.state = 'sent'
                
            except Exception as e:
                _logger.error("Queue Push Failed: %s", e)
                push.error_message = str(e)
                push.retry_count += 1
                
                # If "Gone" or "410", the subscription is dead.
                if "410" in str(e) or "Gone" in str(e):
                    push.state = 'failed'
                    push.subscription_id.unlink()
                elif push.retry_count > 5:
                    push.state = 'failed'
                # Else: leave as 'draft' to retry next time
