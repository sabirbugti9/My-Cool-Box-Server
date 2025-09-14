import { prisma } from "../server.js";
import express from "express";

const router = express.Router();

// ============ PRIVACY POLICY ============
export const getPrivacyPolicy = async (req, res) => {
    try {
        let content = await prisma.staticContent.findUnique({
            where: { key: "privacy-policy" },
        });

        if (!content) {
            content = await prisma.staticContent.create({
                data: {
                    key: "privacy-policy",
                    contentEn: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Privacy Policy - MyCoolBox</title>
  <style>
    body{font-family: Arial, Helvetica, sans-serif; line-height:1.6; color:#222; padding:16px;}
    h1,h2{color:#0b63a3}
    p{margin:8px 0;}
    ul{margin:8px 0 16px 20px;}
    .small{font-size:0.9em;color:#666}
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="small">Last updated: September 12, 2025</p>

  <p>Welcome to <strong>MyCoolBox</strong>. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.</p>

  <h2>1. Information We Collect</h2>
  <ul>
    <li>Account details (name, email, phone, password).</li>
    <li>Payment details (via third-party processors).</li>
    <li>Order history & usage data.</li>
    <li>Device info (IP, logs, analytics).</li>
  </ul>

  <h2>2. Use of Information</h2>
  <p>We use data to provide services, process orders, send updates, prevent fraud, and improve the app.</p>

  <h2>3. Sharing</h2>
  <p>We never sell your data. We only share with service providers (payments, delivery) or when legally required.</p>

  <h2>4. Security</h2>
  <p>We implement reasonable safeguards, but no system is 100% secure.</p>

  <h2>5. Rights</h2>
  <p>You may request access, correction, or deletion of your data.</p>

  <h2>6. Children</h2>
  <p>Our app is not intended for children under 13.</p>

  <h2>7. Updates</h2>
  <p>We may update this Privacy Policy and notify you of changes.</p>

  <h2>8. Contact</h2>
  <p>Email us at: <a href="mailto:support@mycoolbox.com">support@mycoolbox.com</a></p>
</body>
</html>`,
                    contentAr: `<!doctype html>
<html lang="ar">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>سياسة الخصوصية - MyCoolBox</title>
  <style>
    body{font-family: "Helvetica Neue", Arial, sans-serif; line-height:1.8; color:#222; padding:16px; direction:rtl; text-align:right;}
    h1,h2{color:#0b63a3}
    p{margin:8px 0;}
    ul{margin:8px 0 16px 20px; list-style: inside;}
    .small{font-size:0.95em;color:#666}
  </style>
</head>
<body dir="rtl">
  <h1>سياسة الخصوصية</h1>
  <p class="small">آخر تحديث: 12 سبتمبر 2025</p>

  <p>مرحبًا بك في <strong>MyCoolBox</strong>. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام خدماتنا.</p>

  <h2>1. المعلومات التي نجمعها</h2>
  <ul>
    <li>تفاصيل الحساب (الاسم، البريد الإلكتروني، الهاتف، كلمة المرور).</li>
    <li>معلومات الدفع (من خلال مزودي دفع خارجيين).</li>
    <li>سجل الطلبات وبيانات الاستخدام.</li>
    <li>معلومات الجهاز (العنوان IP، السجلات، التحليلات).</li>
  </ul>

  <h2>2. كيفية الاستخدام</h2>
  <p>نستخدم البيانات لتقديم الخدمات، معالجة الطلبات، إرسال التحديثات، منع الاحتيال، وتحسين التطبيق.</p>

  <h2>3. المشاركة</h2>
  <p>لا نبيع بياناتك. نشاركها فقط مع مزودي الخدمة (الدفع، التوصيل) أو إذا طلب القانون.</p>

  <h2>4. الأمان</h2>
  <p>نطبق تدابير حماية معقولة، ولكن لا يوجد نظام آمن 100%.</p>

  <h2>5. حقوقك</h2>
  <p>يمكنك طلب الوصول أو التصحيح أو الحذف لبياناتك.</p>

  <h2>6. الأطفال</h2>
  <p>التطبيق غير مخصص للأطفال دون 13 سنة.</p>

  <h2>7. التحديثات</h2>
  <p>قد نقوم بتحديث سياسة الخصوصية ونخطر المستخدمين بالتغييرات.</p>

  <h2>8. تواصل معنا</h2>
  <p>راسلنا على: <a href="mailto:support@mycoolbox.com">support@mycoolbox.com</a></p>
</body>
</html>`,
                },
            });
        }

        res.json({ en: content.contentEn, ar: content.contentAr });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch privacy policy" });
    }
};

export const updatePrivacyPolicy = async (req, res) => {
    try {
        const { contentEn, contentAr } = req.body;

        if (!contentEn || !contentAr) {
            return res
                .status(400)
                .json({ error: "Both English and Arabic content are required" });
        }

        const updatedContent = await prisma.staticContent.upsert({
            where: { key: "privacy-policy" },
            update: { contentEn, contentAr, updatedAt: new Date() },
            create: { key: "privacy-policy", contentEn, contentAr },
        });

        res.json({
            message: "Privacy policy updated successfully",
            en: updatedContent.contentEn,
            ar: updatedContent.contentAr,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update privacy policy" });
    }
};

// ============ TERMS ============
export const getTermsConditions = async (req, res) => {
    try {
        let content = await prisma.staticContent.findUnique({
            where: { key: "terms-conditions" },
        });

        if (!content) {
            content = await prisma.staticContent.create({
                data: {
                    key: "terms-conditions",
                    contentEn: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Terms & Conditions - MyCoolBox</title>
  <style>
    body{font-family: Arial, Helvetica, sans-serif; line-height:1.6; color:#222; padding:16px;}
    h1,h2{color:#0b63a3}
    p{margin:8px 0;}
    ul{margin:8px 0 16px 20px;}
    .small{font-size:0.9em;color:#666}
  </style>
</head>
<body>
  <h1>Terms & Conditions</h1>
  <p class="small">Last updated: September 12, 2025</p>

  <h2>1. Acceptance</h2>
  <p>By using MyCoolBox you agree to these Terms. If you disagree, do not use the service.</p>

  <h2>2. Eligibility</h2>
  <p>You must be at least 18 years old to use MyCoolBox.</p>

  <h2>3. Orders & Payments</h2>
  <p>Orders depend on item availability. Payments are handled securely by third parties.</p>

  <h2>4. Refund Policy</h2>
  <p>Refunds are processed according to company rules and applicable law.</p>

  <h2>5. Account</h2>
  <p>You are responsible for your account security.</p>

  <h2>6. Limitation of Liability</h2>
  <p>MyCoolBox is not liable for indirect or incidental damages.</p>

  <h2>7. Intellectual Property</h2>
  <p>All app content belongs to MyCoolBox.</p>

  <h2>8. Changes</h2>
  <p>We may update these Terms at any time.</p>

  <h2>9. Contact</h2>
  <p>Email: <a href="mailto:support@mycoolbox.com">support@mycoolbox.com</a></p>
</body>
</html>`,
                    contentAr: `<!doctype html>
<html lang="ar">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>الشروط والأحكام - MyCoolBox</title>
  <style>
    body{font-family: "Helvetica Neue", Arial, sans-serif; line-height:1.8; color:#222; padding:16px; direction:rtl; text-align:right;}
    h1,h2{color:#0b63a3}
    p{margin:8px 0;}
    ul{margin:8px 0 16px 20px; list-style: inside;}
    .small{font-size:0.95em;color:#666}
  </style>
</head>
<body dir="rtl">
  <h1>الشروط والأحكام</h1>
  <p class="small">آخر تحديث: 12 سبتمبر 2025</p>

  <h2>1. القبول</h2>
  <p>باستخدام MyCoolBox فإنك توافق على هذه الشروط. إذا لم توافق، يرجى عدم استخدام الخدمة.</p>

  <h2>2. الأهلية</h2>
  <p>يجب أن تكون فوق 18 سنة لاستخدام التطبيق.</p>

  <h2>3. الطلبات والدفع</h2>
  <p>الطلبات تعتمد على توفر العناصر. تتم معالجة المدفوعات بأمان عبر أطراف ثالثة.</p>

  <h2>4. سياسة الاسترداد</h2>
  <p>تتم معالجة الاستردادات حسب قواعد الشركة والقانون.</p>

  <h2>5. الحساب</h2>
  <p>أنت مسؤول عن أمان حسابك.</p>

  <h2>6. تحديد المسؤولية</h2>
  <p>لا تتحمل MyCoolBox المسؤولية عن الأضرار غير المباشرة أو العرضية.</p>

  <h2>7. الملكية الفكرية</h2>
  <p>جميع محتويات التطبيق مملوكة لـ MyCoolBox.</p>

  <h2>8. التغييرات</h2>
  <p>قد نقوم بتحديث هذه الشروط في أي وقت.</p>

  <h2>9. تواصل</h2>
  <p>البريد الإلكتروني: <a href="mailto:support@mycoolbox.com">support@mycoolbox.com</a></p>
</body>
</html>`,
                },
            });
        }

        res.json({ en: content.contentEn, ar: content.contentAr });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch terms & conditions" });
    }
};

// ============ HELP & SUPPORT ============
export const getHelpSupport = async (req, res) => {
    try {
        let support = await prisma.staticContent.findUnique({
            where: { key: "help-support" },
        });

        if (!support) {
            support = await prisma.staticContent.create({
                data: {
                    key: "help-support",
                    contentEn: JSON.stringify({
                        email: "support@mycoolbox.com",
                        call: "+92321312312",
                        faq: [
                            {
                                question: "How do I place an order?",
                                answer:
                                    "To place an order, log in, select your rental, add items, choose delivery, and pay.",
                            },
                        ],
                    }),
                    contentAr: JSON.stringify({
                        email: "support@mycoolbox.com",
                        call: "+92321312312",
                        faq: [
                            {
                                question: "كيف أقوم بتقديم طلب؟",
                                answer:
                                    "لتقديم طلب، قم بتسجيل الدخول، واختر مدة الإيجار، وأضف العناصر، وحدد التوصيل، ثم ادفع.",
                            },
                        ],
                    }),
                },
            });
        }

        res.json({
            en: JSON.parse(support.contentEn),
            ar: JSON.parse(support.contentAr),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch help & support" });
    }
};

export const updateHelpSupport = async (req, res) => {
    try {
        const { contentEn, contentAr } = req.body;

        if (!contentEn || !contentAr) {
            return res
                .status(400)
                .json({ error: "Both English and Arabic content are required" });
        }

        const updatedContent = await prisma.staticContent.upsert({
            where: { key: "help-support" },
            update: { contentEn, contentAr, updatedAt: new Date() },
            create: { key: "help-support", contentEn, contentAr },
        });

        res.json({
            message: "Help & support updated successfully",
            en: JSON.parse(updatedContent.contentEn),
            ar: JSON.parse(updatedContent.contentAr),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update help & support" });
    }
};


export const updateTermsConditions = async (req, res) => {
    try {
        const { contentEn, contentAr } = req.body;

        if (!contentEn || !contentAr) {
            return res
                .status(400)
                .json({ error: "Both English and Arabic HTML content are required" });
        }

        const updatedContent = await prisma.staticContent.upsert({
            where: { key: "terms-conditions" },
            update: { contentEn, contentAr, updatedAt: new Date() },
            create: { key: "terms-conditions", contentEn, contentAr },
        });

        res.json({
            message: "Terms and conditions updated successfully",
            en: updatedContent.contentEn,
            ar: updatedContent.contentAr,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update terms and conditions" });
    }
};