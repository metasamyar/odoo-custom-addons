from odoo import models, api
import re
import logging

_logger = logging.getLogger(__name__)

class MailMessage(models.Model):
    _inherit = 'mail.message'

    @api.model_create_multi
    def create(self, vals_list):
        messages = super().create(vals_list)
        for message in messages:
            # Filter for relevant message types
            if message.message_type not in ('comment', 'notification') or message.is_internal:
                continue
                
            # Avoid notifying the author
            recipients = message.partner_ids
            if message.author_id:
                recipients = recipients - message.author_id
            
            if not recipients:
                continue

            # Clean body
            body_text = 'You have a new message'
            if message.body:
                clean = re.compile('<.*?>')
                body_text = re.sub(clean, '', message.body)
                body_text = body_text[:120] + '...' if len(body_text) > 120 else body_text

            payload = {
                'title': message.author_id.name or 'Odoo Notification',
                'body': body_text,
                'url': f'/web#id={message.res_id}&model={message.model}&view_type=form' if message.res_id and message.model else '/web',
                'icon': f'/web/image/res.partner/{message.author_id.id}/avatar_128' if message.author_id else '/web/static/img/logo.png',
            }

            subscriptions = self.env['push.subscription'].search([('partner_id', 'in', recipients.ids)])
            
            for sub in subscriptions:
                try:
                    # Run in a separate transaction or ensure non-blocking?
                    # For now, synchronous to ensure delivery, but catch errors.
                    sub.send_notification(payload)
                except Exception as e:
                    _logger.error("Failed to send push for message %s to partner %s: %s", message.id, sub.partner_id.name, e)

        return messages
