# Yasmin Reading – عالم القراءة

موقع قصص تفاعلي للصف الأول: 30 قصة عربية، وخمسة أسئلة لكل قصة، ولوحة متابعة خاصة بالمعلم.

## مهم قبل النشر
هذا المشروع يستخدم Firebase Realtime Database وFirebase Authentication حتى تُحفظ النتائج عبر أجهزة مختلفة. ملفات HTML وحدها لا تكفي لمشاركة بيانات الطلاب بأمان.

## 1) إنشاء مشروع Firebase
1. افتح https://console.firebase.google.com/ وأنشئ مشروعًا باسم Yasmin Reading.
2. من Project settings > General > Your apps أنشئ تطبيق Web وانسخ إعدادات Firebase.
3. افتح `firebase-config.js` واستبدل القيم `PASTE_...` بالقيم الحقيقية.
4. من Authentication > Sign-in method فعّل:
   - Anonymous (للطلبة)
   - Email/Password (للمعلم)
5. من Realtime Database أنشئ قاعدة بيانات، واختر Locked mode.
6. افتح Rules والصق محتوى `database.rules.json` بعد استبدال `PASTE_TEACHER_UID_HERE` بمعرّف UID لحساب المعلم.

## 2) إنشاء حساب المعلم وحماية لوحة المعلم
1. من Authentication > Users أضف مستخدمًا للمعلم بالبريد وكلمة مرور قوية.
2. افتح المستخدم وانسخ User UID.
3. ضع UID في ملف `database.rules.json` بدل `PASTE_TEACHER_UID_HERE` ثم انشر القواعد.
4. لا تضع كلمة مرور المعلم داخل ملفات HTML أو JavaScript.
5. أنشئ حساب المعلم من Authentication قبل مشاركة رابط الموقع.

القواعد تسمح للطالب بقراءة/تعديل سجله فقط، وتسمح لحساب UID المعلم بقراءة جميع سجلات الطلاب. بيانات القصص موجودة في الموقع ولا تحتوي بيانات شخصية.

## 3) النشر المجاني
يمكن نشر الموقع عبر Firebase Hosting:
1. ثبّت Node.js ثم Firebase CLI: `npm install -g firebase-tools`
2. سجّل الدخول: `firebase login`
3. داخل مجلد المشروع نفّذ: `firebase init hosting`
4. اختر مشروع Firebase نفسه، واجعل مجلد النشر `public` (أو انقل الملفات إلى المجلد الذي تختاره).
5. اختر عدم استبدال ملف `index.html` الموجود.
6. نفّذ `firebase deploy`.
سيظهر رابط عام ينتهي بـ `web.app` أو `firebaseapp.com`. أرسل الرابط للطلاب والمعلم.

## 4) طريقة الاستخدام
- الطالب يختار «أنا طالب»، يكتب اسمه وصفه، ثم يقرأ القصص ويجيب عن الأسئلة.
- المعلم يختار «أنا معلم» ويدخل بالبريد وكلمة المرور.
- نتائج كل طالب تُحفظ تحت حساب دخول مجهول مستقل، ولذلك يمكن لطلاب مختلفين استخدام أجهزة مختلفة.
- يجب أن يستخدم الطالب نفس بيانات الدخول/الجهاز إذا أراد الرجوع إلى سجله السابق؛ الدخول المجهول لا يضمن استعادة الحساب إذا مسح المتصفح بياناته أو انتقل إلى جهاز آخر.

## ملاحظات مهمة للمدرسة
- لا تطلب من الأطفال معلومات شخصية غير ضرورية.
- استخدم أسماء أولى أو رموز طلاب عند الحاجة إلى خصوصية أعلى.
- راجع سياسة المدرسة وموافقة ولي الأمر قبل جمع بيانات الأطفال.
- Firebase Spark plan مجاني ضمن حدود الاستخدام، لكن قد تتغير الحصص وشروط الفوترة؛ تحقق من صفحة الأسعار الرسمية.
- هذا إصدار تأسيسي جاهز للربط والنشر، ويحتاج إدخال إعدادات Firebase وUID المعلم قبل أن تعمل المزامنة ولوحة المتابعة.

## روابط رسمية
- Firebase Console: https://console.firebase.google.com/
- Firebase Authentication: https://firebase.google.com/docs/auth/web/anonymous-auth
- Realtime Database: https://firebase.google.com/docs/database/web/start
- Database Security Rules: https://firebase.google.com/docs/database/security
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Firebase Pricing: https://firebase.google.com/pricing
