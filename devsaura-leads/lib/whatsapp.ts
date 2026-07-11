export function generateWhatsAppLink(
  agencyNumber: string,
  leadName: string,
  service: string,
  message: string
): string {
  const number = agencyNumber.replace(/[^\d]/g, "");
  const text = [
    `Hi DevsAura! 👋 I'm *${leadName}* and I'm interested in your *${service}* service.`,
    ``,
    message,
  ].join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
