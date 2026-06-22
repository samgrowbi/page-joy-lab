# Skin Specialist Chatbot

צ'אט בוט AI שמדבר כמו יועצת עור אמיתית של Lumiere by Adriana, מייעץ על הטיפולים, ומסוגל לקבוע תור מלא בתוך השיחה — בלי לצאת ל-/book.

## חוויית משתמש

**מיקום**: בועה צפה ימנית-תחתונה (לא מסתירה את ה-StickyCTA — נמקם משמאל ל-CTA או נדאג ל-z-index/spacing).

**מצב סגור**: כפתור עגול ורוד עם אווטאר של Adriana + נקודה ירוקה "Online" + טקסט עדין "Chat with a Specialist".

**מצב פתוח**: חלון 380×600px (במובייל full-screen) עם:
- Header: תמונה + שם "Adriana's Studio · Skin Specialist" + סטטוס Online + כפתור סגירה
- אזור הודעות גליל אוטומטי + Markdown
- אינדיקציית הקלדה ("...") בזמן ש-AI עונה
- Composer: textarea + כפתור שליחה
- הודעת פתיחה אוטומטית: "Hi 💕 I'm here to help you choose the right treatment and book your spot. What's bothering you most about your skin lately?"

**Quick Replies** (כפתורי-צ'יפ מתחת להודעת הפתיחה): "Fine lines & wrinkles", "Sagging skin", "Dark spots", "Just exploring", "Book a session"

## פרסונה ושיטת מכירה

המודל מקבל system prompt מקיף:
- **זהות**: יועצת עור מטעם הסטודיו של Adriana, חמה, מקצועית, לא דחפנית
- **שפה**: אנגלית בלבד (האתר באנגלית). שיחה אישית, לא רובוטית, משפטים קצרים, אמוג'י עדינים בלבד
- **ידע מלא** על 4 הטיפולים: LED Light Therapy, Instant Lift, LED + Cryo, Body Sculpting — מחירים, משך, מתאים למי, איך זה עובד, FAQ. הידע מוזן מ-`src/config/treatments.ts` בזמן ריצה
- **שיטת המרה**: שואלת על הבעיה → מקשרת רגשית ("a lot of women your age feel exactly that") → מציעה את הטיפול הנכון → מסבירה בקצרה למה זה עובד → מציעה לקבוע "a quick free consultation slot"
- **Guardrails**: לא מאבחנת מצבים רפואיים, לא מבטיחה תוצאות, מפנה לרופא במקרים אדומים, לא מציעה טיפולים שלא בקטלוג

## זרימת הזמנת תור בתוך הצ'אט

הבוט מצויד בכלים (AI SDK tools) שמאפשרים לו לבצע בפועל את ההזמנה:

1. **`recommend_treatment(concern)`** — מחזירה את הטיפול המומלץ + מחיר + סלוג
2. **`get_available_dates(treatmentSlug, monthYYYYMM)`** — קוראת ל-`acuity-availability`
3. **`get_available_times(treatmentSlug, date)`** — קוראת ל-`acuity-times`
4. **`book_appointment(treatmentSlug, datetime, firstName, lastName, email, phone)`** — קוראת ל-`acuity-book`. מסומן `needsApproval` כדי שתופיע כרטיסיית "Confirm booking" עם הפרטים, וצריך לחיצת אישור לפני שליחה ל-Acuity

הבוט אוסף שם, אימייל וטלפון בשיחה ("Perfect! What's the best email to send the confirmation to?"), ואז מציג סלוטים פנויים כ-chips לחיצים. אחרי ההזמנה — מציג כרטיסיית הצלחה עם תאריך/שעה ולינק ל-/thank-you (כולל אותם פרמטרים שהדף מצפה להם).

## רנדור הודעות מיוחדות

הצ'אט מציג גם UI מובנה (לא רק טקסט):
- **כרטיסיית טיפול**: כשהבוט ממליץ — תמונה + שם + מחיר + כפתור "Book this"
- **בורר תאריכים**: רשת של chips של תאריכים פנויים מ-Acuity
- **בורר שעות**: chips של שעות זמינות
- **כרטיסיית אישור**: סיכום הזמנה + "Confirm" / "Change"
- **כרטיסיית הצלחה**: ✓ ירוק + "Booked for {date} {time}" + "View confirmation →"

## פרטים טכניים

**Database (Lovable Cloud)** — שתי טבלאות:
- `chat_conversations`: id, session_id (לא חייב משתמש מחובר — שימוש ב-anon UUID ב-localStorage), started_at, last_message_at, lead_email, lead_phone, lead_name, booked_appointment_id (nullable)
- `chat_messages`: id, conversation_id, role ('user'/'assistant'/'tool'), content (jsonb — שומר UIMessage parts), created_at
- RLS: גישה אנונימית מותרת לפי `session_id` (header X-Session-Id) — אין PII רגיש, רק שיחה. כן — ננעל UPDATE/DELETE ל-service-role בלבד

**Edge Function**: `supabase/functions/skin-specialist-chat/index.ts`
- משתמש ב-Vercel AI SDK עם Lovable AI Gateway, מודל `openai/gpt-5`
- `streamText` עם system prompt + tools + `stopWhen: stepCountIs(50)`
- מקבל `UIMessage[]` + `sessionId`, מחזיר `toUIMessageStreamResponse({ originalMessages, onFinish })` ושומר את ההודעה הסופית ל-`chat_messages`
- ה-tools של Acuity קוראים ל-edge functions הקיימים `acuity-availability/times/book` (server-to-server דרך `fetch` ל-supabase URL)
- מטפל ב-429 (rate limit) ו-402 (credits) עם הודעות ברורות
- מבדיל treatments לפי slug → טוען appointmentTypeId

**Client**:
- חבילות חדשות: `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `react-markdown`, `remark-gfm`
- AI Elements קומפוננטות: `conversation`, `message`, `prompt-input`, `shimmer`, `tool` (מותקן דרך CLI)
- קומפוננטה ראשית: `src/components/chat/SkinSpecialistChat.tsx` (הבועה + החלון)
- Hook: `src/hooks/useSkinChat.ts` — עוטף `useChat` עם `DefaultChatTransport` שמכוון ל-edge function, מעביר `sessionId` (מ-localStorage), טוען היסטוריה ראשונית מה-DB
- בכל פתיחת חלון: GET `chat_messages` של ה-session → ממיר ל-`UIMessage[]` → מעביר ל-`useChat` initialMessages
- ההודעה הראשונה הקבועה ("Hi 💕...") נשמרת רק אחרי שהמשתמש שולח ראשון, כדי לא לזהם DB בשיחות ריקות
- מנוע אנליטיקה קיים (`src/lib/analytics.ts`): events חדשים `chat_opened`, `chat_message_sent`, `chat_booking_completed`

**Lead capture (גם אם לא הזמין)**: ברגע שהמשתמש מוסר אימייל/טלפון בשיחה, ה-tool `save_lead(email, phone, name, concern)` שומר ל-`chat_conversations` כדי שתוכלי לראות לידים גם בלי הזמנה.

**ביטול תופעות לוואי**:
- ExitIntentPopup — אם הצ'אט פתוח, לא להראות
- StickyCTA — להזיז שמאלה במובייל כדי לא להתנגש בבועה

## טכנולוגיה

| רכיב | בחירה |
|---|---|
| מודל | `openai/gpt-5` דרך Lovable AI Gateway |
| SDK | Vercel AI SDK (`ai`, `@ai-sdk/react`) |
| UI | AI Elements (`Conversation`, `Message`, `PromptInput`, `Shimmer`, `Tool`) + רכיבים מותאמים לכרטיסי טיפול/תאריך |
| Backend | Supabase Edge Function `skin-specialist-chat` |
| DB | 2 טבלאות עם RLS לפי session_id |
| Booking | tools שקוראים ל-edge functions קיימים של Acuity |

## אבני דרך ליישום

1. מיגרציית DB ל-`chat_conversations` + `chat_messages` + RLS
2. Edge function `skin-specialist-chat` עם system prompt, tools, וכתיבה ל-DB
3. התקנת חבילות AI SDK + AI Elements
4. קומפוננטות צ'אט (בועה, חלון, כרטיסיות מיוחדות)
5. אינטגרציה לאתר (`App.tsx`), התאמת StickyCTA + ExitIntentPopup
6. אנליטיקה
7. בדיקות end-to-end: שיחת ייעוץ, הזמנת תור מלאה, ריענון דף ושחזור היסטוריה

## הערות

- לא נדרש login — השיחה עובדת לכל מבקר עם session_id ב-localStorage
- מחיר: השיחות עולות קרדיטים של Lovable AI לפי שימוש (GPT-5 יקר יחסית); אם תרצי לחסוך נוכל לעבור ל-Gemini Flash בעלות נמוכה משמעותית
- אם בעתיד תרצי dashboard לראות שיחות ולידים — נוסיף עמוד admin מוגן
