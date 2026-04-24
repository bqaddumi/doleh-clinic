import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'ar';

type TranslationValue = string | ((params: Record<string, string | number>) => string);

const translations = {
  en: {
    common: {
      appName: 'Doleh Clinic',
      dashboard: 'Dashboard',
      patients: 'Patients',
      reports: 'Reports',
      reservations: 'Reservations',
      logout: 'Logout',
      login: 'Login',
      save: 'Save',
      cancel: 'Cancel',
      email: 'Email',
      password: 'Password',
      signingIn: 'Signing in...',
      search: 'Search',
      actions: 'Actions',
      name: 'Name',
      id: 'ID',
      phone: 'Phone',
      age: 'Age',
      gender: 'Gender',
      address: 'Address',
      condition: 'Condition',
      notes: 'Notes',
      patient: 'Patient',
      patientId: 'Patient ID',
      reportId: 'Report ID',
      date: 'Date',
      time: 'Time',
      diagnosis: 'Diagnosis',
      treatmentPlan: 'Treatment Plan',
      sessionNotes: 'Session Notes',
      progress: 'Progress',
      attachments: 'Attachments',
      savePatient: 'Save Patient',
      saveReport: 'Save Report',
      saving: 'Saving...',
      addPatient: 'Add Patient',
      addReport: 'Add Report',
      exportCsv: 'Export CSV',
      importCsv: 'Import CSV',
      downloadSample: 'Download Sample',
      editPatient: 'Edit Patient',
      editReport: 'Edit Report',
      view: 'View',
      accept: 'Accept',
      reject: 'Reject',
      noAttachments: 'No attachments.',
      notAvailable: 'N/A',
      male: 'Male',
      female: 'Female',
      improving: 'Improving',
      stable: 'Stable',
      worse: 'Worse',
      recentPatients: 'Recent Patients',
      totalPatients: 'Total patients',
      totalReports: 'Total reports',
      sortBy: 'Sort By',
      order: 'Order',
      descending: 'Descending',
      ascending: 'Ascending',
      createdDate: 'Created Date',
      lastVisit: 'Last Visit',
      allPatients: 'All Patients',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      status: 'Status',
      language: 'Language',
      english: 'English',
      arabic: 'Arabic',
      unknownPatient: 'Unknown patient',
      darkMode: 'Dark',
      lightMode: 'Light',
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      importSuccess: ({ count }: Record<string, string | number>) => `${count} rows imported successfully.`,
      importFailed: 'CSV import failed.',
      importEmpty: 'No valid CSV rows found.',
      uploadCsvHint: 'Upload a CSV file with matching column names.'
    },
    loginPage: {
      title: 'Doleh Clinic',
      subtitle: 'Secure access for doctors and clinic administrators.'
    },
    dashboardPage: {
      subtitle: 'Overview of clinic activity and quick actions.',
      noPatientsTitle: 'No patients yet',
      noPatientsDescription: 'Add your first patient to start managing records.',
      lastVisitLabel: 'Last visit',
      reportsTrend: 'Reports Trend',
      progressOverview: 'Progress Overview',
      conditionsOverview: 'Condition Breakdown',
      reportsTrendSubtitle: 'Monthly reports created over the last six months.',
      progressOverviewSubtitle: 'Current spread of patient progress states.',
      conditionsOverviewSubtitle: 'Most common conditions across active patients.'
    },
    patientsPage: {
      subtitle: 'Search, review, and update patient records.',
      noPatientsTitle: 'No patients found',
      noPatientsDescription: 'Try adjusting the search filters or add a new patient.',
      foundCount: ({ count }: Record<string, string | number>) => `${count} patients found`,
      patientSubtitle: ({ condition }: Record<string, string | number>) => `Condition: ${condition}`,
      formSubtitle: 'Maintain accurate patient information for clinical follow-up.',
      reportsEmpty: 'No reports recorded for this patient yet.',
      deleteConfirm: ({ name }: Record<string, string | number>) => `Delete ${name}?`,
      fullName: 'Full Name'
    },
    reportsPage: {
      subtitle: 'Track clinical sessions, progress, and treatment plans.',
      formSubtitle: 'Capture diagnosis, treatment plan, and progress updates.',
      noReportsTitle: 'No reports found',
      noReportsDescription: 'Add a report or adjust the filters.',
      detailsTitle: 'Report Details',
      sessionDate: ({ date }: Record<string, string | number>) => `Session date: ${date}`,
      attachmentsHint: 'One URL per line',
      uploadFiles: 'Upload Files',
      uploading: 'Uploading...',
      uploadHint: 'Upload attachments here or paste URLs in the field beside it.',
      uploadFailed: 'Attachment upload failed.',
      detailsPatient: 'Patient',
      detailsDiagnosis: 'Diagnosis',
      detailsTreatment: 'Treatment Plan',
      detailsSessionNotes: 'Session Notes',
      detailsProgress: 'Progress'
    },
    reservationsPage: {
      adminSubtitle: 'Review patient requests, confirm time slots, and update decisions.',
      patientSubtitle: 'Request a reservation and follow your latest booking updates.',
      requestReservation: 'Request Reservation',
      addReservation: 'Add Reservation',
      newReservationTitle: 'New Reservation',
      reservationDateTime: 'Reservation Date & Time',
      adminNotes: 'Admin Notes',
      reviewedAt: 'Reviewed At',
      manageReservation: 'Manage Reservation',
      quickActions: 'Quick Actions',
      allStatuses: 'All Statuses',
      dateAvailabilityHint: 'Only Sunday to Thursday business dates with open slots can be selected.',
      selectDateFirst: 'Select a date first to see available times.',
      timeGapHint: 'Unavailable times are disabled to keep a 45-minute gap between reservations.',
      createSuccess: 'Reservation request submitted successfully.',
      updateSuccess: 'Reservation updated successfully.',
      noReservationsTitle: 'No reservations found',
      noReservationsDescription: 'There are no reservation requests matching the current filter.',
      noOwnReservationsTitle: 'No reservations yet',
      noOwnReservationsDescription: 'Submit your first reservation request to get started.',
      totalReservations: ({ count }: Record<string, string | number>) => `${count} reservations`
    },
    landingPage: {
      title: 'Reserve Your Session With Doleh Clinic',
      subtitle: 'Book your physiotherapy session quickly and follow today’s queue in real time.',
      currentSession: 'Current Session',
      noCurrentSession: 'No active session right now.',
      todayQueue: 'Today Queue',
      todayQueueHint: 'Live count of today’s scheduled reservations.',
      reserveTitle: 'Reserve a Date',
      reserveSubtitle: 'Enter your name, phone number, and preferred time to request a reservation.',
      todaysReservations: 'Today’s Reservations',
      queueNumber: 'Queue Number',
      noReservationsTitle: 'No reservations for today',
      noReservationsDescription: 'Today’s queue is currently empty.'
    },
    validation: {
      validEmail: 'Valid email is required',
      passwordMin: 'Password must be at least 6 characters',
      nameRequired: 'Name is required',
      phoneRequired: 'Phone is required',
      ageRequired: 'Age is required',
      conditionRequired: 'Condition is required',
      patientRequired: 'Patient is required',
      dateRequired: 'Date is required',
      diagnosisRequired: 'Diagnosis is required',
      treatmentPlanRequired: 'Treatment plan is required',
      sessionNotesRequired: 'Session notes are required'
    }
  },
  ar: {
    common: {
      appName: 'Doleh Clinic',
      dashboard: 'لوحة التحكم',
      patients: 'المرضى',
      reports: 'التقارير',
      reservations: 'الحجوزات',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      save: 'حفظ',
      cancel: 'إلغاء',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      signingIn: 'جاري تسجيل الدخول...',
      search: 'بحث',
      actions: 'الإجراءات',
      name: 'الاسم',
      id: 'المعرف',
      phone: 'الهاتف',
      age: 'العمر',
      gender: 'الجنس',
      address: 'العنوان',
      condition: 'الحالة',
      notes: 'ملاحظات',
      patient: 'المريض',
      patientId: 'معرف المريض',
      reportId: 'معرف التقرير',
      date: 'التاريخ',
      time: 'الوقت',
      diagnosis: 'التشخيص',
      treatmentPlan: 'الخطة العلاجية',
      sessionNotes: 'ملاحظات الجلسة',
      progress: 'التقدم',
      attachments: 'المرفقات',
      savePatient: 'حفظ المريض',
      saveReport: 'حفظ التقرير',
      saving: 'جاري الحفظ...',
      addPatient: 'إضافة مريض',
      addReport: 'إضافة تقرير',
      exportCsv: 'تصدير CSV',
      importCsv: 'استيراد CSV',
      downloadSample: 'تنزيل نموذج',
      editPatient: 'تعديل المريض',
      editReport: 'تعديل التقرير',
      view: 'عرض',
      accept: 'قبول',
      reject: 'رفض',
      noAttachments: 'لا توجد مرفقات.',
      notAvailable: 'غير متوفر',
      male: 'ذكر',
      female: 'أنثى',
      improving: 'تحسن',
      stable: 'مستقر',
      worse: 'تدهور',
      recentPatients: 'أحدث المرضى',
      totalPatients: 'إجمالي المرضى',
      totalReports: 'إجمالي التقارير',
      sortBy: 'الترتيب حسب',
      order: 'الترتيب',
      descending: 'تنازلي',
      ascending: 'تصاعدي',
      createdDate: 'تاريخ الإنشاء',
      lastVisit: 'آخر زيارة',
      allPatients: 'كل المرضى',
      dateFrom: 'من تاريخ',
      dateTo: 'إلى تاريخ',
      status: 'الحالة',
      language: 'اللغة',
      english: 'الإنجليزية',
      arabic: 'العربية',
      unknownPatient: 'مريض غير معروف',
      darkMode: 'داكن',
      lightMode: 'فاتح',
      pending: 'قيد الانتظار',
      accepted: 'مقبول',
      rejected: 'مرفوض',
      importSuccess: ({ count }: Record<string, string | number>) => `تم استيراد ${count} صف بنجاح.`,
      importFailed: 'فشل استيراد ملف CSV.',
      importEmpty: 'لم يتم العثور على صفوف CSV صالحة.',
      uploadCsvHint: 'ارفع ملف CSV بأسماء أعمدة مطابقة.'
    },
    loginPage: {
      title: 'Doleh Clinic',
      subtitle: 'وصول آمن للأطباء وإداريي العيادة.'
    },
    dashboardPage: {
      subtitle: 'نظرة عامة على نشاط العيادة والإجراءات السريعة.',
      noPatientsTitle: 'لا يوجد مرضى بعد',
      noPatientsDescription: 'أضف أول مريض لبدء إدارة السجلات.',
      lastVisitLabel: 'آخر زيارة',
      reportsTrend: 'اتجاه التقارير',
      progressOverview: 'نظرة على التقدم',
      conditionsOverview: 'توزيع الحالات',
      reportsTrendSubtitle: 'عدد التقارير التي أُنشئت خلال آخر ستة أشهر.',
      progressOverviewSubtitle: 'التوزيع الحالي لحالات تقدم المرضى.',
      conditionsOverviewSubtitle: 'أكثر الحالات شيوعًا بين المرضى الحاليين.'
    },
    patientsPage: {
      subtitle: 'ابحث وراجع وحدّث سجلات المرضى.',
      noPatientsTitle: 'لم يتم العثور على مرضى',
      noPatientsDescription: 'جرّب تعديل عوامل البحث أو أضف مريضًا جديدًا.',
      foundCount: ({ count }: Record<string, string | number>) => `تم العثور على ${count} مريض`,
      patientSubtitle: ({ condition }: Record<string, string | number>) => `الحالة: ${condition}`,
      formSubtitle: 'حافظ على بيانات المريض الدقيقة للمتابعة السريرية.',
      reportsEmpty: 'لا توجد تقارير مسجلة لهذا المريض بعد.',
      deleteConfirm: ({ name }: Record<string, string | number>) => `هل تريد حذف ${name}؟`,
      fullName: 'الاسم الكامل'
    },
    reportsPage: {
      subtitle: 'تابع الجلسات العلاجية والتقدم والخطط العلاجية.',
      formSubtitle: 'سجّل التشخيص والخطة العلاجية وتحديثات التقدم.',
      noReportsTitle: 'لم يتم العثور على تقارير',
      noReportsDescription: 'أضف تقريرًا أو عدّل عوامل التصفية.',
      detailsTitle: 'تفاصيل التقرير',
      sessionDate: ({ date }: Record<string, string | number>) => `تاريخ الجلسة: ${date}`,
      attachmentsHint: 'رابط واحد في كل سطر',
      uploadFiles: 'رفع ملفات',
      uploading: 'جارٍ الرفع...',
      uploadHint: 'ارفع المرفقات هنا أو الصق الروابط في الحقل المجاور.',
      uploadFailed: 'فشل رفع المرفقات.',
      detailsPatient: 'المريض',
      detailsDiagnosis: 'التشخيص',
      detailsTreatment: 'الخطة العلاجية',
      detailsSessionNotes: 'ملاحظات الجلسة',
      detailsProgress: 'التقدم'
    },
    reservationsPage: {
      adminSubtitle: 'راجع طلبات المرضى وحدد المواعيد وحدّث القرار.',
      patientSubtitle: 'اطلب حجزًا وتابع آخر تحديثات الموعد الخاص بك.',
      requestReservation: 'طلب حجز',
      addReservation: 'إضافة حجز',
      newReservationTitle: 'حجز جديد',
      reservationDateTime: 'تاريخ ووقت الحجز',
      adminNotes: 'ملاحظات الإدارة',
      reviewedAt: 'تاريخ المراجعة',
      manageReservation: 'إدارة الحجز',
      quickActions: 'إجراءات سريعة',
      allStatuses: 'كل الحالات',
      dateAvailabilityHint: 'يمكن اختيار أيام العمل من الأحد إلى الخميس فقط إذا كانت تحتوي على مواعيد متاحة.',
      selectDateFirst: 'اختر التاريخ أولاً لعرض الأوقات المتاحة.',
      timeGapHint: 'الأوقات غير المتاحة معطلة للحفاظ على فجوة 45 دقيقة بين الحجوزات.',
      createSuccess: 'تم إرسال طلب الحجز بنجاح.',
      updateSuccess: 'تم تحديث الحجز بنجاح.',
      noReservationsTitle: 'لا توجد حجوزات',
      noReservationsDescription: 'لا توجد طلبات حجز تطابق عامل التصفية الحالي.',
      noOwnReservationsTitle: 'لا توجد حجوزات بعد',
      noOwnReservationsDescription: 'أرسل أول طلب حجز للبدء.',
      totalReservations: ({ count }: Record<string, string | number>) => `${count} حجوزات`
    },
    landingPage: {
      title: 'احجز جلستك مع Doleh Clinic',
      subtitle: 'احجز جلسة العلاج الطبيعي بسرعة وتابع ترتيب حجوزات اليوم مباشرة.',
      currentSession: 'الجلسة الحالية',
      noCurrentSession: 'لا توجد جلسة نشطة الآن.',
      todayQueue: 'طابور اليوم',
      todayQueueHint: 'عدد الحجوزات المجدولة لليوم بشكل مباشر.',
      reserveTitle: 'احجز موعدًا',
      reserveSubtitle: 'أدخل اسمك ورقم هاتفك والوقت المناسب لطلب الحجز.',
      todaysReservations: 'حجوزات اليوم',
      queueNumber: 'رقم الدور',
      noReservationsTitle: 'لا توجد حجوزات اليوم',
      noReservationsDescription: 'طابور اليوم فارغ حاليًا.'
    },
    validation: {
      validEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordMin: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      nameRequired: 'الاسم مطلوب',
      phoneRequired: 'الهاتف مطلوب',
      ageRequired: 'العمر مطلوب',
      conditionRequired: 'الحالة مطلوبة',
      patientRequired: 'المريض مطلوب',
      dateRequired: 'التاريخ مطلوب',
      diagnosisRequired: 'التشخيص مطلوب',
      treatmentPlanRequired: 'الخطة العلاجية مطلوبة',
      sessionNotesRequired: 'ملاحظات الجلسة مطلوبة'
    }
  }
} as const;

type TranslationKey = `${keyof typeof translations.en}.${string}`;

interface LanguageContextValue {
  language: Language;
  direction: 'ltr' | 'rtl';
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getNestedValue = (language: Language, key: TranslationKey): TranslationValue | undefined => {
  const segments = key.split('.');
  let current: unknown = translations[language];

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return current as TranslationValue | undefined;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('app_language');
    return stored === 'ar' ? 'ar' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      direction: language === 'ar' ? 'rtl' : 'ltr',
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === 'en' ? 'ar' : 'en')),
      t: (key, params = {}) => {
        const valueForKey = getNestedValue(language, key) || getNestedValue('en', key);
        if (typeof valueForKey === 'function') {
          return valueForKey(params);
        }
        return valueForKey || key;
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
