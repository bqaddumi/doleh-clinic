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
      logout: 'Logout',
      login: 'Login',
      email: 'Email',
      password: 'Password',
      signingIn: 'Signing in...',
      search: 'Search',
      actions: 'Actions',
      name: 'Name',
      phone: 'Phone',
      age: 'Age',
      gender: 'Gender',
      address: 'Address',
      condition: 'Condition',
      notes: 'Notes',
      patient: 'Patient',
      date: 'Date',
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
      editPatient: 'Edit Patient',
      editReport: 'Edit Report',
      view: 'View',
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
      language: 'Language',
      english: 'English',
      arabic: 'Arabic',
      unknownPatient: 'Unknown patient',
      darkMode: 'Dark',
      lightMode: 'Light'
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
      detailsPatient: 'Patient',
      detailsDiagnosis: 'Diagnosis',
      detailsTreatment: 'Treatment Plan',
      detailsSessionNotes: 'Session Notes',
      detailsProgress: 'Progress'
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
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      signingIn: 'جاري تسجيل الدخول...',
      search: 'بحث',
      actions: 'الإجراءات',
      name: 'الاسم',
      phone: 'الهاتف',
      age: 'العمر',
      gender: 'الجنس',
      address: 'العنوان',
      condition: 'الحالة',
      notes: 'ملاحظات',
      patient: 'المريض',
      date: 'التاريخ',
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
      editPatient: 'تعديل المريض',
      editReport: 'تعديل التقرير',
      view: 'عرض',
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
      language: 'اللغة',
      english: 'الإنجليزية',
      arabic: 'العربية',
      unknownPatient: 'مريض غير معروف',
      darkMode: 'داكن',
      lightMode: 'فاتح'
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
      detailsPatient: 'المريض',
      detailsDiagnosis: 'التشخيص',
      detailsTreatment: 'الخطة العلاجية',
      detailsSessionNotes: 'ملاحظات الجلسة',
      detailsProgress: 'التقدم'
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
