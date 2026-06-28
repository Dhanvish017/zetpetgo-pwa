// Frontend WhatsApp message templates
// Used ONLY for Reminder template selection & preview
// Missed & Thank You messages DO NOT have template selection
// Backend controls actual WhatsApp message content

export const REMINDER_TEMPLATES = [
  {
    id: "FRIENDLY_V1",
    title: "Friendly Reminder (Version 1)",
    preview:
      "A gentle reminder that your pet is due for vaccination. We’re here to help keep your pet healthy and protected.",
  },
  {
    id: "FRIENDLY_V2",
    title: "Friendly Reminder (Version 2)",
    preview:
      "Your pet has an upcoming vaccination due. Please contact us to schedule a visit at your convenience.",
  },
  {
    id: "EMOTIONAL_CARING",
    title: "Emotional & Caring Reminder",
    preview:
      "We know your pet is a beloved family member. This is a caring reminder about an upcoming vaccination to protect their health.",
  },
];

// Default reminder template
export const DEFAULT_REMINDER_TEMPLATE_ID = "FRIENDLY_V1";

export const MESSAGE_TEMPLATES_UI = {
  REMINDER: REMINDER_TEMPLATES,
  BIRTHDAY: [
    { id: "BIRTHDAY_V1", title: "Birthday Wishes", preview: "Wishing your furry friend a very happy birthday! May they enjoy many more healthy years." },
  ],
  NEW_OWNER: [
    { id: "NEW_OWNER_V1", title: "Welcome Message", preview: "Welcome to our clinic! We're excited to help you take the best care of your new companion." },
  ],
  THANK_YOU: [
    { id: "THANKYOU_V1", title: "Thank You", preview: "Thank you for visiting our clinic. We appreciate your trust in us for your pet's healthcare." },
  ],
  THREE_MONTHS: [
    { id: "THREE_MONTHS_V1", title: "3-Month Checkup", preview: "It's been 3 months since your last visit. Time for a routine checkup to keep your pet in great shape!" },
  ],
  MISSED: [
    { id: "MISSED_V1", title: "Missed Appointment", preview: "We noticed you missed a recent appointment. Your pet's health is important — please reschedule at your convenience." },
  ],
};
