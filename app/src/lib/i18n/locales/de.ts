/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
  metadata: {
    title: "MegaPDF - Kostenloser PDF-Konverter, Editor, OCR & PDF entsperren",
    template: "%s | MegaPDF - PDF-Tools",
    description: "Konvertieren, bearbeiten, entsperren, komprimieren, zusammenführen, teilen & OCR für PDFs mit MegaPDF. Kostenlose, schnelle Online-PDF-Tools—keine Downloads erforderlich.",
    keywords: "PDF-Konverter, PDF-Editor, OCR online, PDF entsperren, PDF komprimieren, PDF zusammenführen, PDF teilen, kostenlose PDF-Tools, Online-PDF-Editor, MegaPDF"
  },
  nav: {
    tools: "Werkzeuge",
    company: "Unternehmen",
    pricing: "Api Preise",
    convertPdf: "PDF konvertieren",
    convertPdfDesc: "PDFs in andere Formate und umgekehrt umwandeln",
    selectLanguage: "Sprache auswählen",
    downloadApp: "App herunterladen",
    getApp: "Holen Sie sich unsere mobile App für PDF-Werkzeuge unterwegs",
    appStores: "MegaPDF-App holen",
    mobileTools: "PDF-Werkzeuge unterwegs",
    signIn: "Anmelden",
    signUp: "Registrieren",
    signOut: "Abmelden",
    dashboard: "Dashboard",
    profile: "Profil",
    account: "Konto"
  },
  auth: {
    email: "E-Mail",
    emailPlaceholder: "name@example.com",
    password: "Passwort",
    passwordPlaceholder: "Ihr Passwort",
    confirmPassword: "Passwort bestätigen",
    confirmPasswordPlaceholder: "Passwort bestätigen",
    forgotPassword: "Passwort vergessen?",
    rememberMe: "Angemeldet bleiben",
    signIn: "Anmelden",
    signingIn: "Wird angemeldet...",
    orContinueWith: "Oder fortfahren mit",
    dontHaveAccount: "Haben Sie kein Konto?",
    signUp: "Registrieren",
    loginSuccess: "Erfolgreich angemeldet",
    loginError: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    invalidCredentials: "Ungültige E-Mail oder Passwort",
    emailRequired: "E-Mail ist erforderlich",
    passwordRequired: "Passwort ist erforderlich",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    name: "Name",
    namePlaceholder: "Ihr Name",
    createAccount: "Konto erstellen",
    creatingAccount: "Konto wird erstellt...",
    alreadyHaveAccount: "Haben Sie bereits ein Konto?",
    nameRequired: "Name ist erforderlich",
    passwordLength: "Passwort muss mindestens 8 Zeichen lang sein",
    passwordStrength: "Passwortstärke",
    passwordWeak: "Schwach",
    passwordFair: "Ausreichend",
    passwordGood: "Gut",
    passwordStrong: "Stark",
    passwordsDoNotMatch: "Passwörter stimmen nicht überein",
    agreeTerms: "Ich stimme den",
    termsOfService: "Nutzungsbedingungen",
    and: "und",
    privacyPolicy: "Datenschutzrichtlinien",
    agreeToTerms: "Bitte stimmen Sie den Nutzungsbedingungen zu",
    registrationFailed: "Registrierung fehlgeschlagen",
    accountCreated: "Konto erfolgreich erstellt",
    unknownError: "Ein Fehler ist aufgetreten",
    forgotInstructions: "Geben Sie Ihre E-Mail ein, und wir senden Ihnen Anweisungen zur Zurücksetzung Ihres Passworts.",
    sendResetLink: "Link zum Zurücksetzen senden",
    sending: "Wird gesendet...",
    resetEmailSent: "E-Mail zum Zurücksetzen des Passworts gesendet",
    resetPasswordError: "Fehler beim Senden der Zurücksetzungs-E-Mail",
    checkYourEmail: "Überprüfen Sie Ihre E-Mails",
    resetInstructions: "Falls ein Konto mit dieser E-Mail existiert, haben wir Anweisungen zum Zurücksetzen Ihres Passworts gesendet.",
    didntReceiveEmail: "Keine E-Mail erhalten?",
    tryAgain: "Erneut versuchen",
    backToLogin: "Zurück zur Anmeldung",
    validatingToken: "Ihr Zurücksetzungslink wird überprüft...",
    invalidToken: "Dieser Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.",
    requestNewLink: "Einen neuen Zurücksetzungslink anfordern",
    passwordResetSuccess: "Passwort erfolgreich zurückgesetzt",
    passwordResetSuccessMessage: "Ihr Passwort wurde erfolgreich zurückgesetzt. Sie werden in Kürze zur Anmeldeseite weitergeleitet.",
    passwordResetSuccessSubtext: "Wenn Sie nicht automatisch weitergeleitet werden, klicken Sie auf die Schaltfläche unten.",
    resettingPassword: "Passwort wird zurückgesetzt...",
    resetPassword: "Passwort zurücksetzen",
    verifyYourEmail: "Bestätigen Sie Ihre E-Mail",
    checkYourInbox: "Überprüfen Sie Ihren Posteingang, um die Registrierung abzuschließen",
    verificationEmailSentTo: "Wir haben eine Bestätigungs-E-Mail gesendet an",
    pleaseClickLink: " Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu verifizieren.",
    checkSpamFolder: "Überprüfen Sie Ihren Spam-Ordner oder",
    alreadyVerified: "Bereits verifiziert?",

    oAuthAccountNotLinked: "Diese E-Mail ist bereits mit einer anderen Anmeldemethode verknüpft. Bitte melden Sie sich mit der ursprünglich verwendeten Methode an.",
    accessDenied: "Zugriff verweigert. Sie haben keine Berechtigung, auf diese Ressource zuzugreifen.",
    googleSignIn: "Google",
    hidePassword: "Passwort ausblenden",
    showPassword: "Passwort anzeigen",
  },
  login: {
    title: "Melden Sie sich bei Ihrem Konto an",
    description: "Geben Sie Ihre Anmeldedaten ein, um auf Ihr Dashboard zuzugreifen",
    termsAndPrivacy: "Durch die Anmeldung stimmen Sie unseren <termsLink>Nutzungsbedingungen</termsLink> und der <privacyLink>Datenschutzrichtlinie</privacyLink> zu.",
    footer: "© 2025 MegaPDF. Alle Rechte vorbehalten."
  },
  dashboard: {
    title: "Dashboard",
    overview: "Übersicht",
    apiKeys: "API-Schlüssel",
    subscription: "Abonnement",
    profile: "Profil",
    totalUsage: "Gesamtnutzung",
    operations: "Operationen diesen Monat",
    active: "Aktiv",
    inactive: "Inaktiv",
    keysAllowed: "erlaubte Schlüssel",
    mostUsed: "Meistgenutzt",
    of: "von",
    files: "Dateien",
    usageByOperation: "Nutzung nach Operation",
    apiUsageBreakdown: "Ihre API-Nutzungsaufstellung für den aktuellen Monat",
    noData: "Keine Daten verfügbar",
    createApiKey: "API-Schlüssel erstellen",
    revokeApiKey: "API-Schlüssel widerrufen",
    confirmRevoke: "Sind Sie sicher, dass Sie diesen API-Schlüssel widerrufen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
    keyRevoked: "API-Schlüssel erfolgreich widerrufen",
    noApiKeys: "Keine API-Schlüssel",
    noApiKeysDesc: "Sie haben noch keine API-Schlüssel erstellt.",
    createFirstApiKey: "Erstellen Sie Ihren ersten API-Schlüssel",
    keyName: "Schlüsselname",
    keyNamePlaceholder: "Mein API-Schlüssel",
    keyNameDesc: "Geben Sie Ihrem Schlüssel einen beschreibenden Namen, um ihn später leicht zu identifizieren.",
    permissions: "Berechtigungen",
    generateKey: "Schlüssel generieren",
    newApiKeyCreated: "Neuer API-Schlüssel erstellt",
    copyKeyDesc: "Kopieren Sie diesen Schlüssel jetzt. Aus Sicherheitsgründen können Sie ihn später nicht mehr sehen!",
    copyAndClose: "Kopieren und schließen",
    keyCopied: "API-Schlüssel in die Zwischenablage kopiert",
    lastUsed: "Zuletzt verwendet",
    never: "Nie",
    operationsThisMonth: "Vorgänge in diesem Monat",
    status: {
      active: "Aktiv",
      inactive: "Inaktiv"
    },
    usageBreakdown: "Ihre API-Nutzungsaufstellung für den aktuellen Monat",
    none: "Keine",
    percentageOfTotal: "der Gesamtnutzung"

  },
  subscription: {
    currentPlan: "Aktueller Plan",
    subscriptionDetails: "Ihre Abonnementdetails und Nutzungsbeschränkungen",
    plan: "Plan",
    free: "Kostenlos",
    basic: "Basis",
    pro: "Pro",
    enterprise: "Unternehmen",
    renewsOn: "Ihr Abonnement wird erneuert am",
    cancelSubscription: "Abonnement kündigen",
    changePlan: "Plan ändern",
    upgrade: "Upgrade",
    downgrade: "Downgrade",
    features: "Funktionen",
    limitations: "Einschränkungen",
    confirm: "Bestätigen",
    subscriptionCanceled: "Abonnement erfolgreich gekündigt",
    upgradeSuccess: "Abonnement erfolgreich aktualisiert",
    pricingPlans: "Preispläne",
    monthly: "Monat",
    operationsPerMonth: "Operationen pro Monat",
    requestsPerHour: "Anfragen pro Stunde",
    apiKey: "API-Schlüssel",
    apiKeys: "API-Schlüssel",
    basicPdf: "Grundlegende PDF-Operationen",
    allPdf: "Alle PDF-Operationen",
    basicOcr: "Grundlegende OCR",
    advancedOcr: "Erweiterte OCR",
    prioritySupport: "Priorisierter Support",
    customWatermarks: "Benutzerdefinierte Wasserzeichen",
    noWatermarking: "Keine Wasserzeichen",
    limitedOcr: "Begrenzte OCR",
    noPrioritySupport: "Kein priorisierter Support",
    dedicatedSupport: "Dedizierter Support",
    customIntegration: "Hilfe bei benutzerdefinierter Integration",
    whiteLabel: "White-Label-Optionen",
    success: {
      title: "Abonnement aktiviert",
      description: "Ihr Abonnement wurde erfolgreich aktiviert",
      message: "Vielen Dank für Ihr Abonnement bei MegaPDF! Sie haben jetzt Zugriff auf alle Funktionen Ihres Abonnement-Tarifs.",
      cta: "Zum Dashboard gehen",
      seo: {
        title: "Abonnement erfolgreich aktiviert - MegaPDF",
        description: "Ihr MegaPDF-Abonnement wurde aktiviert. Entdecken Sie alle Premium-Funktionen, die Ihnen jetzt zur Verfügung stehen."
      }
    },
    cancel: {
      title: "Abonnement storniert",
      description: "Ihr Abonnementvorgang wurde abgebrochen",
      message: "Der Abonnementvorgang wurde abgebrochen. Es wurden keine Änderungen an Ihrem Konto vorgenommen. Sie können es gerne wieder versuchen, wenn Sie bereit sind.",
      cta: "Zurück zu den Plänen",
      seo: {
        title: "Abonnement storniert - MegaPDF",
        description: "Ihr Abonnementvorgang wurde abgebrochen. Sie können jederzeit später ein Abonnement abschließen, wenn Sie bereit sind."
      }
    }
  },
  profile: {
    // Personal Information
    personalInfo: "Persönliche Informationen",
    updatePersonalInfo: "Aktualisieren Sie Ihre persönlichen Informationen",
    name: "Name",
    namePlaceholder: "Geben Sie Ihren vollständigen Namen ein",
    email: "E-Mail",
    emailUnchangeable: "E-Mail kann nicht geändert werden",
    memberSince: "Mitglied seit",
    updateProfile: "Profil aktualisieren",
    updating: "Aktualisierung läuft...",
    updateSuccess: "Profil erfolgreich aktualisiert",
    updateFailed: "Profilaktualisierung fehlgeschlagen",
    updateError: "Ein Fehler ist bei der Aktualisierung Ihres Profils aufgetreten",

    // Password Management
    changePassword: "Passwort ändern",
    updatePasswordDesc: "Aktualisieren Sie Ihr Kontopasswort",
    currentPassword: "Aktuelles Passwort",
    currentPasswordPlaceholder: "Geben Sie Ihr aktuelles Passwort ein",
    newPassword: "Neues Passwort",
    newPasswordPlaceholder: "Geben Sie ein neues Passwort ein",
    confirmPassword: "Neues Passwort bestätigen",
    confirmPasswordPlaceholder: "Bestätigen Sie Ihr neues Passwort",
    changingPassword: "Passwort wird geändert...",
    passwordUpdateSuccess: "Passwort erfolgreich aktualisiert",
    passwordUpdateFailed: "Passwortaktualisierung fehlgeschlagen",
    passwordUpdateError: "Ein Fehler ist bei der Aktualisierung Ihres Passworts aufgetreten",

    // Password Validation
    passwordWeak: "Schwach",
    passwordFair: "Ausreichend",
    passwordGood: "Gut",
    passwordStrong: "Stark",
    passwordMismatch: "Neue Passwörter stimmen nicht überein",
    passwordLength: "Passwort muss mindestens 8 Zeichen lang sein",
    passwordStrength: "Passwortstärke",
    passwordTips: "Wählen Sie aus Sicherheitsgründen ein starkes Passwort mit mindestens 8 Zeichen, einschließlich Groß- und Kleinbuchstaben, Zahlen und Symbolen."
  },

  // Hero-Bereich
  hero: {
    badge: "Leistungsstarke PDF-Tools",
    title: "All-in-One PDF Konverter & Editor",
    description: "Kostenlose Online-PDF-Tools zum Konvertieren, Komprimieren, Zusammenführen, Teilen, Drehen, Wasserzeichen hinzufügen und mehr. Keine Installation erforderlich.",
    btConvert: "Jetzt konvertieren",
    btTools: "Alle Tools erkunden"
  },

  popular: {
    pdfToWord: "PDF zu Word",
    pdfToWordDesc: "Konvertieren Sie Ihre PDF-Dateien einfach in bearbeitbare DOC- und DOCX-Dokumente.",
    pdfToExcel: "PDF zu Excel",
    pdfToExcelDesc: "Extrahieren Sie Daten direkt aus PDFs in Excel-Tabellen in wenigen Sekunden.",
    pdfToPowerPoint: "PDF zu PowerPoint",
    pdfToPowerPointDesc: "Verwandeln Sie Ihre PDF-Präsentationen in bearbeitbare PowerPoint-Folien.",
    pdfToJpg: "PDF zu JPG",
    pdfToJpgDesc: "Konvertieren Sie PDF-Seiten in JPG-Bilder oder extrahieren Sie alle Bilder aus einem PDF.",
    pdfToPng: "PDF zu PNG",
    pdfToPngDesc: "Konvertieren Sie PDF-Seiten in transparente PNG-Bilder in hoher Qualität.",
    pdfToHtml: "PDF zu HTML",
    pdfToHtmlDesc: "Verwandeln Sie PDF-Dokumente in webfreundliches HTML-Format.",
    wordToPdf: "Word zu PDF",
    wordToPdfDesc: "Konvertieren Sie Word-Dokumente mit perfekter Formatierung und Layout in PDF.",
    excelToPdf: "Excel zu PDF",
    excelToPdfDesc: "Verwandeln Sie Ihre Excel-Tabellen in perfekt formatierte PDF-Dokumente.",
    powerPointToPdf: "PowerPoint zu PDF",
    powerPointToPdfDesc: "Konvertieren Sie PowerPoint-Präsentationen in PDF für einfaches Teilen.",
    jpgToPdf: "JPG zu PDF",
    jpgToPdfDesc: "Erstellen Sie PDF-Dateien aus Ihren JPG-Bildern mit anpassbaren Optionen.",
    pngToPdf: "PNG zu PDF",
    pngToPdfDesc: "Konvertieren Sie PNG-Bilder in PDF mit Unterstützung für transparenten Hintergrund.",
    htmlToPdf: "HTML zu PDF",
    htmlToPdfDesc: "Konvertieren Sie Webseiten und HTML-Inhalte in PDF-Dokumente.",
    mergePdf: "PDFs zusammenführen",
    mergePdfDesc: "Kombinieren Sie PDFs in der gewünschten Reihenfolge mit dem einfachsten PDF-Merger.",
    splitPdf: "PDF teilen",
    splitPdfDesc: "Extrahieren Sie bestimmte Seiten oder teilen Sie PDFs in mehrere Dokumente.",
    compressPdf: "PDF komprimieren",
    compressPdfDesc: "Reduzieren Sie die Dateigröße bei optimaler PDF-Qualität.",
    rotatePdf: "PDF drehen",
    rotatePdfDesc: "Ändern Sie die Seitenausrichtung, indem Sie PDF-Seiten nach Bedarf drehen.",
    watermark: "Wasserzeichen hinzufügen",
    watermarkDesc: "Fügen Sie Text- oder Bildwasserzeichen hinzu, um Ihre PDF-Dokumente zu schützen und zu branden.",
    unlockPdf: "PDF entsperren",
    unlockPdfDesc: "Entfernen Sie den Passwortschutz und Einschränkungen von PDF-Dateien.",
    protectPdf: "PDF schützen",
    protectPdfDesc: "Fügen Sie Passwortschutz hinzu, um Ihre PDF-Dokumente zu sichern.",
    signPdf: "PDF signieren",
    signPdfDesc: "Fügen Sie Ihren PDF-Dokumenten sicher digitale Signaturen hinzu.",
    ocr: "OCR",
    ocrDesc: "Extrahieren Sie Text aus gescannten Dokumenten mit Optical Character Recognition.",
    editPdf: "PDF bearbeiten",
    editPdfDesc: "Nehmen Sie Änderungen an Text, Bildern und Seiten in Ihren PDF-Dokumenten vor.",
    redactPdf: "PDF schwärzen",
    redactPdfDesc: "Entfernen Sie sensible Informationen dauerhaft aus Ihren PDF-Dateien.",
    viewAll: "Alle PDF-Tools anzeigen"
  },

  // Konverter-Bereich
  converter: {
    title: "Jetzt konvertieren",
    description: "Laden Sie Ihr PDF hoch und wählen Sie das Format, in das Sie konvertieren möchten",
    tabUpload: "Hochladen & Konvertieren",
    tabApi: "API-Integration",
    apiTitle: "Integrieren Sie unsere API",
    apiDesc: "Verwenden Sie unsere REST-API, um PDFs programmgesteuert in Ihrer Anwendung zu konvertieren",
    apiDocs: "API-Dokumentation anzeigen"
  },

  // Konvertierungsseite
  convert: {
    title: {
      pdfToWord: "PDF zu Word online konvertieren - Kostenloser PDF zu DOC Konverter",
      pdfToExcel: "PDF zu Excel online konvertieren - PDF-Daten in XLS extrahieren",
      pdfToPowerPoint: "PDF zu PowerPoint konvertieren - PDF zu PPT Konverter",
      pdfToJpg: "PDF zu JPG Bild konvertieren - Hochwertige PDF zu JPEG Konvertierung",
      pdfToPng: "PDF zu PNG online konvertieren - PDF zu transparentem PNG",
      pdfToHtml: "PDF zu HTML Webseite konvertieren - PDF zu HTML5 Konverter",
      wordToPdf: "Word zu PDF online konvertieren - Kostenloser DOC zu PDF Konverter",
      excelToPdf: "Excel zu PDF konvertieren - XLS zu PDF Konverter",
      powerPointToPdf: "PowerPoint zu PDF online konvertieren - PPT zu PDF",
      jpgToPdf: "JPG zu PDF online konvertieren - Bild zu PDF Erstellung",
      pngToPdf: "PNG zu PDF konvertieren - Transparentes Bild zu PDF Konverter",
      htmlToPdf: "HTML zu PDF online konvertieren - Webseite zu PDF Generator",
      generic: "Online Datei Konverter - Dokumente, Bilder und mehr konvertieren"
    },
    description: {
      pdfToWord: "Konvertieren Sie PDF-Dokumente schnell und einfach in bearbeitbare Word-Dateien. Unser kostenloser PDF zu Word Konverter behält die Formatierung für DOC/DOCX bei.",
      pdfToExcel: "Extrahieren Sie Tabellen und Daten aus PDF-Dateien in Excel-Tabellen. Konvertieren Sie PDF zu XLS/XLSX mit genauer Datenformatierung für die Analyse.",
      pdfToPowerPoint: "Verwandeln Sie PDF-Präsentationen in bearbeitbare PowerPoint-Folien. Unser PDF zu PPT Konverter behält Folienlayouts und Designelemente bei.",
      pdfToJpg: "Konvertieren Sie PDF-Seiten in hochwertige JPG-Bilder. Extrahieren Sie Bilder aus PDF oder speichern Sie jede Seite als JPEG zum Online-Teilen.",
      pdfToPng: "Konvertieren Sie PDF-Seiten in transparente PNG-Bilder. Ideal für Grafikdesigner, die PDF-Elemente mit transparentem Hintergrund benötigen.",
      pdfToHtml: "Konvertieren Sie PDF-Dokumente in HTML-Webseiten. Erstellen Sie responsive HTML5-Websites aus PDF-Dateien mit unserem fortschrittlichen Konverter.",
      wordToPdf: "Konvertieren Sie Word-Dokumente mit perfekter Formatierung in das PDF-Format. Kostenloser DOC/DOCX zu PDF Konverter für professionelle Ergebnisse.",
      excelToPdf: "Konvertieren Sie Excel-Tabellen in PDF-Dokumente. Behalten Sie Formeln, Diagramme und Tabellen beim Konvertieren von XLS/XLSX zu PDF bei.",
      powerPointToPdf: "Konvertieren Sie PowerPoint-Präsentationen in das PDF-Format. PPT/PPTX zu PDF Konverter behält Folienübergänge und Notizen bei.",
      jpgToPdf: "Erstellen Sie PDF-Dateien aus Ihren JPG-Bildern. Kombinieren Sie mehrere JPEG-Fotos in ein einziges PDF-Dokument online.",
      pngToPdf: "Erstellen Sie PDF-Dateien aus Ihren PNG-Bildern. Konvertieren Sie transparente PNG-Grafiken in PDF, während die Transparenz erhalten bleibt.",
      htmlToPdf: "Konvertieren Sie HTML-Webseiten in PDF-Dokumente. Speichern Sie Websites als PDF mit unserem Online HTML zu PDF Generator.",
      generic: "Wählen Sie eine Datei zur Konvertierung zwischen Formaten. Kostenloser Online-Dokumentenkonverter für PDF, Word, Excel, PowerPoint, JPG, PNG und HTML."
    },
    howTo: {
      title: "Wie man {from} zu {to} online konvertiert",
      step1: {
        title: "Datei hochladen",
        description: "Laden Sie die {from}-Datei hoch, die Sie von Ihrem Computer, Google Drive oder Dropbox konvertieren möchten"
      },
      step2: {
        title: "Format konvertieren",
        description: "Klicken Sie auf die Schaltfläche Konvertieren und unser System verarbeitet Ihre Datei mit fortschrittlicher Konvertierungstechnologie"
      },
      step3: {
        title: "Ergebnis herunterladen",
        description: "Laden Sie Ihre konvertierte {to}-Datei sofort herunter oder erhalten Sie einen teilbaren Link"
      }
    },
    options: {
      title: "Erweiterte Konvertierungsoptionen",
      ocr: "OCR aktivieren (Optical Character Recognition)",
      ocrDescription: "Text aus gescannten Dokumenten oder Bildern für bearbeitbare Ausgabe extrahieren",
      preserveLayout: "Originales Layout beibehalten",
      preserveLayoutDescription: "Behalten Sie die ursprüngliche Formatierung und das Layout des Dokuments genau bei",
      quality: "Ausgabequalität",
      qualityDescription: "Legen Sie die Qualitätsstufe für die konvertierte Datei fest (beeinflusst die Dateigröße)",
      qualityOptions: {
        low: "Niedrig (kleinere Dateigröße, schnellere Verarbeitung)",
        medium: "Mittel (ausgewogene Qualität und Größe)",
        high: "Hoch (beste Qualität, größere Dateien)"
      },
      pageOptions: "Seitenoptionen",
      allPages: "Alle Seiten",
      selectedPages: "Ausgewählte Seiten",
      pageRangeDescription: "Geben Sie Seitenzahlen und/oder Seitenbereiche durch Kommas getrennt ein",
      pageRangeExample: "Beispiel: 1,3,5-12 (konvertiert Seiten 1, 3 und 5 bis 12)"
    },
    moreTools: "Verwandte Dokumentenkonvertierungstools",
    expertTips: {
      title: "Experten-Tipps zur Konvertierung",
      pdfToWord: [
        "Für die besten PDF zu Word Ergebnisse stellen Sie sicher, dass Ihr PDF klaren, maschinenlesbaren Text enthält",
        "Aktivieren Sie OCR für gescannte Dokumente oder bildbasierte PDFs, um bearbeitbaren Text zu extrahieren",
        "Komplexe Layouts erfordern möglicherweise kleine Anpassungen nach der Konvertierung für perfekte Formatierung"
      ],
      pdfToExcel: [
        "Tabellen mit klaren Rändern werden genauer von PDF zu Excel konvertiert",
        "Vorverarbeiten Sie gescannte PDFs mit OCR für eine bessere Datenextraktion zu XLS/XLSX",
        "Überprüfen Sie Tabellenformeln nach der Konvertierung, da sie möglicherweise nicht automatisch übertragen werden"
      ],
      generic: [
        "Höhere Qualitätseinstellungen führen zu größeren Dateien, aber besserer Ausgabe",
        "Verwenden Sie OCR für Dokumente mit gescanntem Text oder Bildern, die Text enthalten",
        "Vorschau Ihrer Datei nach der Konvertierung immer überprüfen, um Genauigkeit vor dem Herunterladen sicherzustellen"
      ]
    },
    advantages: {
      title: "Vorteile der Konvertierung von {from} zu {to}",
      pdfToWord: [
        "Bearbeiten und ändern Sie Text, der im PDF-Format gesperrt war, mit unserem DOC-Konverter",
        "Aktualisieren Sie Inhalte, ohne das gesamte Dokument von Grund auf neu zu erstellen",
        "Extrahieren Sie Informationen zur Verwendung in anderen Word-Dokumenten oder Vorlagen"
      ],
      pdfToExcel: [
        "Analysieren und manipulieren Sie Daten, die in statischer PDF-Form vorlagen, mit XLS-Tools",
        "Erstellen Sie Diagramme und führen Sie Berechnungen mit extrahierten Tabellendaten durch",
        "Aktualisieren Sie Finanzberichte oder numerische Informationen einfach im Excel-Format"
      ],
      wordToPdf: [
        "Erstellen Sie universell lesbare PDF-Dokumente, die die perfekte Formatierung beibehalten",
        "Schützen Sie Inhalte vor unerwünschten Änderungen mit sicherem PDF-Output",
        "Gewährleisten Sie ein konsistentes Dokumentenaussehen auf allen Geräten und Plattformen"
      ],
      generic: [
        "Verwandeln Sie Ihr Dokument in ein nützlicheres und bearbeitbares Format",
        "Greifen Sie auf Inhalte zu und verwenden Sie sie in Programmen, die den Ziel-Dateityp unterstützen",
        "Teilen Sie Dateien in Formaten, die andere ohne spezielle Software leicht öffnen können"
      ]
    }
  },
  features: {
    title: "Erweiterte PDF-Tools & Funktionen | MegaPDF",
    description: "Entdecken Sie die umfassende Suite von MegaPDF an PDF-Tools und Funktionen für Dokumentenverwaltung, Konvertierung, Bearbeitung und mehr.",

    hero: {
      title: "Erweiterte PDF-Tools & Funktionen",
      description: "Lernen Sie die umfassende Suite von Tools und Funktionen kennen, die MegaPDF zur ultimativen Lösung für all Ihre Dokumentenverwaltungsbedürfnisse macht."
    },

    overview: {
      power: {
        title: "Leistungsstarke Verarbeitung",
        description: "Fortschrittliche Algorithmen gewährleisten eine hochwertige Dokumentenverarbeitung und -konvertierung mit außergewöhnlicher Genauigkeit."
      },
      security: {
        title: "Bankniveau-Sicherheit",
        description: "Ihre Dokumente sind mit 256-Bit-SSL-Verschlüsselung geschützt und werden nach der Verarbeitung automatisch gelöscht."
      },
      accessibility: {
        title: "Universelle Zugänglichkeit",
        description: "Greifen Sie von jedem Gerät auf Ihre Dokumente und unsere Tools zu mit vollständiger plattformübergreifender Kompatibilität."
      }
    },

    allFeatures: {
      title: "Alle Funktionen"
    },

    learnMore: "Erfahren Sie mehr",

    categories: {
      conversion: {
        title: "PDF-Konvertierung",
        description: "Konvertieren Sie PDFs in verschiedene Formate und umgekehrt mit hoher Genauigkeit und Beibehaltung der Formatierung.",
        features: {
          pdfToWord: {
            title: "PDF zu Word Konvertierung",
            description: "Konvertieren Sie PDF-Dateien in bearbeitbare Word-Dokumente mit erhaltenem Format, Tabellen und Bildern."
          },
          pdfToExcel: {
            title: "PDF zu Excel Konvertierung",
            description: "Extrahieren Sie Tabellen aus PDFs in bearbeitbare Excel-Tabellen mit genauer Datenformatierung."
          },
          pdfToImage: {
            title: "PDF zu Bild Konvertierung",
            description: "Konvertieren Sie PDF-Seiten in hochwertige JPG-, PNG- oder TIFF-Bilder mit anpassbarer Auflösung."
          },
          officeToPdf: {
            title: "Office zu PDF Konvertierung",
            description: "Konvertieren Sie Word-, Excel- und PowerPoint-Dateien in das PDF-Format mit erhaltenem Layout und Formatierung."
          }
        }
      },

      editing: {
        title: "PDF-Bearbeitung & Verwaltung",
        description: "Bearbeiten, organisieren und optimieren Sie Ihre PDF-Dokumente mit unserem umfassenden Toolset.",
        features: {
          merge: {
            title: "PDFs zusammenführen",
            description: "Kombinieren Sie mehrere PDF-Dateien in ein einziges Dokument mit anpassbarer Seitenreihenfolge."
          },
          split: {
            title: "PDFs teilen",
            description: "Teilen Sie große PDFs in kleinere Dokumente nach Seitenbereichen oder extrahieren Sie bestimmte Seiten."
          },
          compress: {
            title: "PDFs komprimieren",
            description: "Reduzieren Sie die Dateigröße von PDFs bei gleichbleibender Qualität für einfacheres Teilen und Speichern."
          },
          watermark: {
            title: "Wasserzeichen hinzufügen",
            description: "Fügen Sie Text- oder Bild-Wasserzeichen zu Ihren PDFs mit anpassbarer Transparenz, Position und Rotation hinzu."
          }
        }
      },

      security: {
        title: "PDF-Sicherheit & Schutz",
        description: "Sichern Sie Ihre PDF-Dokumente mit Verschlüsselung, Passwortschutz und digitalen Signaturen.",
        features: {
          protect: {
            title: "Passwortschutz",
            description: "Verschlüsseln Sie PDFs mit Passwortschutz, um den Zugriff zu kontrollieren und unbefugtes Anzeigen zu verhindern."
          },
          unlock: {
            title: "PDF-Entsperrung",
            description: "Entfernen Sie den Passwortschutz von PDFs, bei denen Sie autorisierten Zugriff haben."
          },
          signature: {
            title: "Digitale Signaturen",
            description: "Fügen Sie digitale Signaturen zu PDFs hinzu für Dokumentenauthentifizierung und -verifizierung."
          },
          redaction: {
            title: "PDF-Schließung",
            description: "Entfernen Sie sensible Informationen dauerhaft aus PDF-Dokumenten."
          }
        }
      },

      ocr: {
        title: "OCR-Technologie",
        description: "Extrahieren Sie Text aus gescannten Dokumenten und Bildern mit unserer fortschrittlichen OCR-Technologie.",
        features: {
          textExtraction: {
            title: "Textextraktion",
            description: "Extrahieren Sie Text aus gescannten PDFs und Bildern mit hoher Genauigkeit und Sprachunterstützung."
          },
          searchable: {
            title: "Durchsuchbare PDFs",
            description: "Konvertieren Sie gescannte Dokumente in durchsuchbare PDFs mit Texterkennung."
          },
          multilingual: {
            title: "Mehrsprachige Unterstützung",
            description: "OCR-Unterstützung für über 100 Sprachen, einschließlich nicht-lateinischer Schriften und Sonderzeichen."
          },
          batchProcessing: {
            title: "Stapelverarbeitung",
            description: "Verarbeiten Sie mehrere Dokumente gleichzeitig mit unseren effizienten Stapel-OCR-Fähigkeiten."
          }
        }
      },

      api: {
        title: "API & Integration",
        description: "Integrieren Sie unsere PDF-Verarbeitungsfunktionen in Ihre Anwendungen mit unserem robusten API.",
        features: {
          restful: {
            title: "RESTful API",
            description: "Einfache und leistungsstarke RESTful API für PDF-Verarbeitung und Dokumentenverwaltung."
          },
          sdks: {
            title: "SDKs & Bibliotheken",
            description: "Entwicklerfreundliche SDKs für verschiedene Programmiersprachen, einschließlich JavaScript, Python und PHP."
          },
          webhooks: {
            title: "Webhooks",
            description: "Echtzeit-Ereignisbenachrichtigungen für asynchrone PDF-Verarbeitungsworkflows."
          },
          customization: {
            title: "API-Anpassung",
            description: "Passen Sie die API an Ihre spezifischen Bedürfnisse mit anpassbaren Endpunkten und Parametern an."
          }
        }
      },

      cloud: {
        title: "Cloud-Plattform",
        description: "Greifen Sie von überall auf Ihre Dokumente mit unserer sicheren Cloud-Speicher- und Verarbeitungsplattform zu.",
        features: {
          storage: {
            title: "Cloud-Speicher",
            description: "Speichern und greifen Sie sicher von überall auf Ihre Dokumente mit unserem verschlüsselten Cloud-Speicher zu."
          },
          sync: {
            title: "Geräteübergreifende Synchronisation",
            description: "Synchronisieren Sie Ihre Dokumente nahtlos über alle Ihre Geräte für den Zugriff unterwegs."
          },
          sharing: {
            title: "Dokumentenfreigabe",
            description: "Teilen Sie Dokumente einfach mit sicheren Links und Berechtigungssteuerungen."
          },
          history: {
            title: "Versionsverlauf",
            description: "Verfolgen Sie Dokumentänderungen mit dem Versionsverlauf und stellen Sie bei Bedarf frühere Versionen wieder her."
          }
        }
      },

      enterprise: {
        title: "Unternehmensfunktionen",
        description: "Erweiterte Funktionen, die für geschäftliche und unternehmerische Anforderungen entwickelt wurden.",
        features: {
          batch: {
            title: "Stapelverarbeitung",
            description: "Verarbeiten Sie Hunderte von Dokumenten gleichzeitig mit unserem effizienten Stapelverarbeitungssystem."
          },
          workflow: {
            title: "Benutzerdefinierte Workflows",
            description: "Erstellen Sie automatisierte Dokumentenverarbeitungs-Workflows, die auf Ihre Geschäftsbedürfnisse zugeschnitten sind."
          },
          compliance: {
            title: "Compliance & Audit",
            description: "Verbesserte Sicherheitsfunktionen für GDPR, HIPAA und andere regulatorische Compliance."
          },
          analytics: {
            title: "Nutzungsanalysen",
            description: "Detaillierte Einblicke in Dokumentenverarbeitungsaktivitäten und Benutzeroperationen."
          }
        }
      }
    },

    mobile: {
      title: "MegaPDF Mobile App",
      description: "Nehmen Sie die leistungsstarken PDF-Tools von MegaPDF unterwegs mit. Unsere mobile App bietet dieselbe robuste Funktionalität in einer praktischen, mobilfreundlichen Benutzeroberfläche.",
      feature1: {
        title: "Dokumente scannen & digitalisieren",
        description: "Verwenden Sie Ihre Kamera, um physische Dokumente zu scannen und sie sofort in hochwertige PDFs umzuwandeln."
      },
      feature2: {
        title: "PDFs unterwegs bearbeiten",
        description: "Bearbeiten, kommentieren und unterschreiben Sie PDF-Dokumente von Ihrem Smartphone oder Tablet mit Leichtigkeit."
      },
      feature3: {
        title: "Cloud-Synchronisation",
        description: "Synchronisieren Sie Ihre Dokumente nahtlos über alle Ihre Geräte mit sicherem Cloud-Speicher."
      }
    },

    comparison: {
      title: "Funktionsvergleich",
      description: "Vergleichen Sie unsere verschiedenen Pläne, um denjenigen zu finden, der am besten zu Ihren Bedürfnissen passt.",
      feature: "Funktion",
      free: "Kostenlos",
      basic: "Basic",
      pro: "Pro",
      enterprise: "Unternehmen",
      features: {
        convert: "PDF-Konvertierung",
        merge: "Zusammenführen & Teilen",
        compress: "Kompression",
        ocr: "OCR Basic",
        advancedOcr: "Erweitertes OCR",
        watermark: "Wasserzeichen",
        protect: "Passwortschutz",
        api: "API-Zugriff",
        batch: "Stapelverarbeitung",
        priority: "Prioritätssupport",
        customWorkflow: "Benutzerdefinierte Workflows",
        whiteLabel: "White Labeling",
        dedicated: "Dedizierter Support"
      }
    },

    testimonials: {
      title: "Was unsere Nutzer sagen",
      quote1: "MegaPDF hat die Art und Weise, wie unser Team mit Dokumenten umgeht, revolutioniert. Die OCR-Funktionalität ist unglaublich genau, und die Stapelverarbeitung spart uns jede Woche Stunden.",
      name1: "Sarah Johnson",
      title1: "Operations Manager",
      quote2: "Die API-Integration war nahtlos. Wir haben MegaPDF in unseren Workflow integriert, und der Unterschied in der Effizienz ist enorm. Ihr Support-Team ist auch erstklassig.",
      name2: "David Chen",
      title2: "Tech Lead",
      quote3: "Als Kleinunternehmerin machen die erschwinglichen Preise und das umfassende Toolset MegaPDF zu einem unglaublichen Wert. Ich liebe besonders die mobile App, die es mir ermöglicht, Dokumente unterwegs zu bearbeiten.",
      name3: "Maria Garcia",
      title3: "Geschäftsinhaberin"
    }
  },

  // CTA-Bereich
  cta: {
    title: "Bereit zum Konvertieren?",
    description: "Verwandeln Sie Ihre PDFs in jedes gewünschte Format, komplett kostenlos.",
    startConverting: "Jetzt konvertieren",
    exploreTools: "Alle Tools erkunden",
  },

  // PDF-Tools-Seite
  pdfTools: {
    title: "Alle PDF-Tools",
    description: "Alles, was Sie für die Arbeit mit PDFs benötigen, an einem Ort",
    categories: {
      convertFromPdf: "Von PDF konvertieren",
      convertToPdf: "In PDF konvertieren",
      basicTools: "Grundlegende Tools",
      organizePdf: "PDFs organisieren",
      pdfSecurity: "PDF-Sicherheit"
    }
  },

  // Tool-Beschreibungen
  toolDescriptions: {
    pdfToWord: "Konvertieren Sie Ihre PDF-Dateien einfach in bearbeitbare DOC- und DOCX-Dokumente.",
    pdfToPowerpoint: "Verwandeln Sie Ihre PDF-Dateien in bearbeitbare PPT- und PPTX-Präsentationen.",
    pdfToExcel: "Extrahieren Sie Daten direkt aus PDFs in Excel-Tabellen in wenigen Sekunden.",
    pdfToJpg: "Konvertieren Sie jede PDF-Seite in ein JPG oder extrahieren Sie alle Bilder aus einem PDF.",
    pdfToPng: "Konvertieren Sie jede PDF-Seite in ein PNG oder extrahieren Sie alle Bilder aus einem PDF.",
    pdfToHtml: "Konvertieren Sie Webseiten in HTML zu PDF. Kopieren Sie die URL der Seite und fügen Sie sie ein.",
    wordToPdf: "Machen Sie DOC- und DOCX-Dateien leicht lesbar, indem Sie sie in PDF konvertieren.",
    powerpointToPdf: "Machen Sie PPT- und PPTX-Präsentationen leicht anzeigbar, indem Sie sie in PDF konvertieren.",
    excelToPdf: "Machen Sie Excel-Tabellen leicht lesbar, indem Sie sie in PDF konvertieren.",
    jpgToPdf: "Konvertieren Sie JPG-Bilder in Sekundenschnelle in PDF. Passen Sie Ausrichtung und Ränder leicht an.",
    pngToPdf: "Konvertieren Sie PNG-Bilder in Sekundenschnelle in PDF. Passen Sie Ausrichtung und Ränder leicht an.",
    htmlToPdf: "Konvertieren Sie Webseiten in PDF. Kopieren Sie die URL und fügen Sie sie ein, um sie in PDF zu konvertieren.",
    mergePdf: "Kombinieren Sie PDFs in der gewünschten Reihenfolge mit dem einfachsten PDF-Merger.",
    splitPdf: "Teilen Sie PDF-Dateien in mehrere Dokumente oder extrahieren Sie bestimmte Seiten aus Ihrem PDF.",
    compressPdf: "Reduzieren Sie die Dateigröße bei optimaler PDF-Qualität.",
    rotatePdf: "Drehen Sie Ihre PDFs nach Bedarf. Sie können sogar mehrere PDFs gleichzeitig drehen!",
    watermark: "Stempeln Sie in Sekundenschnelle ein Bild oder Text über Ihr PDF. Wählen Sie Typografie, Transparenz und Position.",
    unlockPdf: "Entfernen Sie den PDF-Passwortschutz, um Ihre PDFs nach Belieben zu verwenden.",
    protectPdf: "Schützen Sie PDF-Dateien mit einem Passwort. Verschlüsseln Sie PDF-Dokumente, um unbefugten Zugriff zu verhindern.",
    ocr: "Extrahieren Sie Text aus gescannten Dokumenten mit Optical Character Recognition."
  },
  splitPdf: {
    title: "PDF teilen - PDF-Seiten online trennen",
    description: "Teilen Sie PDF-Dateien einfach in mehrere Dokumente, löschen Sie Seiten oder extrahieren Sie bestimmte Seiten mit unserem kostenlosen PDF-Splitter-Tool online",
    howTo: {
      title: "Wie man PDF-Dateien online teilt",
      step1: {
        title: "Laden Sie Ihr PDF hoch",
        description: "Datei und klicken Sie, um das PDF hochzuladen, das Sie teilen, Seiten daraus löschen oder Seiten extrahieren möchten, mit unserer Drag-and-Drop-Funktion"
      },
      step2: {
        title: "Seiten zum Teilen auswählen",
        description: "Wählen Sie Ihre Teilungsmethode: Wählen Sie Seiten nach Bereich, trennen Sie PDF-Seiten einzeln oder teilen Sie PDFs alle N Seiten in mehrere Dateien"
      },
      step3: {
        title: "Geteilte Dateien herunterladen",
        description: "Laden Sie Ihre geteilten PDF-Dateien oder getrennten Seiten als einzelne Dokumente sofort herunter"
      }
    },
    options: {
      splitMethod: "Wählen Sie Ihre Teilungsmethode",
      byRange: "Nach Seitenbereichen teilen",
      extractAll: "Alle Seiten als separate PDFs extrahieren",
      everyNPages: "Alle N Seiten teilen",
      everyNPagesNumber: "Anzahl der Seiten pro Datei",
      everyNPagesHint: "Jede Ausgabedatei enthält diese Anzahl an Seiten",
      pageRanges: "Seitenbereiche",
      pageRangesHint: "Geben Sie Seitenbereiche durch Kommas getrennt ein (z. B. 1-5, 8, 11-13), um mehrere PDF-Dateien zu erstellen"
    },
    splitting: "PDF wird geteilt...",
    splitDocument: "Dokument teilen",
    splitSuccess: "PDF erfolgreich geteilt!",
    splitSuccessDesc: "Ihr PDF wurde in {count} separate Dateien aufgeteilt",
    results: {
      title: "Ergebnisse des PDF-Teilens",
      part: "Teil",
      pages: "Seiten",
      pagesCount: "Seiten"
    },
    faq: {
      title: "Häufig gestellte Fragen zum Teilen von PDFs",
      q1: {
        question: "Was passiert mit meinen PDF-Dateien nach dem Teilen?",
        answer: "Alle hochgeladenen und generierten Dateien werden nach 1 Stunden automatisch von unseren Servern gelöscht, um Ihre Privatsphäre und Sicherheit zu gewährleisten."
      },
      q2: {
        question: "Gibt es eine Begrenzung, wie viele Seiten ich teilen kann?",
        answer: "Die kostenlose Version unterstützt PDFs mit bis zu 100 Seiten. Upgraden Sie auf unseren Premium-Plan für größere Dateien oder unbegrenztes Teilen."
      },
      q3: {
        question: "Kann ich Seiten löschen oder bestimmte Seiten aus einem PDF extrahieren?",
        answer: "Ja, verwenden Sie die Option 'Nach Seitenbereichen teilen', um Seiten zu löschen oder bestimmte Abschnitte aus Ihrem PDF online zu extrahieren."
      },
      q4: {
        question: "Kann ich Seiten während des Teilens neu anordnen?",
        answer: "Derzeit wird die Seitenreihenfolge beim Teilen beibehalten. Verwenden Sie unser PDF-Zusammenführungs-Tool mit Drag-and-Drop, um Seiten nach dem Teilen neu anzuordnen."
      }
    },
    useCases: {
      title: "Beliebte Anwendungen für unser PDF-Splitter-Tool",
      chapters: {
        title: "PDF-Seiten nach Kapiteln trennen",
        description: "Teilen Sie große Bücher oder Berichte in einzelne Kapitel für einfacheres Teilen und Navigieren"
      },
      extract: {
        title: "Seiten aus PDF extrahieren",
        description: "Wählen Sie Seiten wie Formulare oder Zertifikate aus, um sie mit einem einfachen Datei- und Klickvorgang aus längeren Dokumenten zu extrahieren"
      },
      remove: {
        title: "Seiten aus PDF löschen",
        description: "Entfernen Sie unerwünschte Seiten wie Werbung oder leere Seiten, indem Sie die zu behaltenden Seiten auswählen und entsprechend teilen"
      },
      size: {
        title: "PDFs in mehrere Dateien teilen zur Größenreduktion",
        description: "Zerlegen Sie große PDFs in kleinere Dateien für einfacheres Versenden per E-Mail oder Messaging mit unserem Online-PDF-Splitter"
      }
    },
    newSection: {
      title: "Warum unser Online-PDF-Splitter verwenden?",
      description: "Unser PDF-Splitter ermöglicht es Ihnen, PDF-Seiten zu trennen, Seiten zu löschen und PDFs schnell und sicher in mehrere Dateien zu teilen. Genießen Sie die Einfachheit von Drag-and-Drop, wählen Sie Seiten präzise aus und verwalten Sie Ihre Dokumente online ohne Software-Downloads.",
      additional: "Ob Sie PDF-Seiten für ein Projekt trennen, unerwünschte Seiten löschen oder PDFs in mehrere Dateien für einfacheres Teilen aufteilen müssen, unser Online-PDF-Splitter ist das perfekte Tool. Mit einer benutzerfreundlichen Drag-and-Drop-Oberfläche können Sie Ihre Datei hochladen und mit einem Klick Seiten mühelos auswählen. Unser Service ist schnell, sicher und kostenlos – ideal für die Verwaltung von PDF-Dokumenten online ohne Software-Installation. Teilen Sie große PDFs, extrahieren Sie bestimmte Seiten oder reduzieren Sie Dateigrößen mit nur wenigen Klicks!"
    },
    seoContent: {
      title: "Meistern Sie Ihre PDF-Verwaltung mit unserem PDF-Splitter",
      p1: "Brauchen Sie eine stressfreie Möglichkeit, PDFs in mehrere Dateien zu teilen oder bestimmte Seiten online herauszuziehen? Unser PDF-Splitter-Tool ist darauf ausgelegt, die Belastung der Dokumentenverwaltung zu reduzieren. Egal, ob Sie Student, vielbeschäftigter Profi oder einfach nur persönliche Dateien organisieren, Sie können Seiten löschen, die gewünschten auswählen und große PDFs im Handumdrehen aufteilen. Ziehen Sie Ihre Datei in den Uploader, klicken Sie, um Ihren Teilungsstil auszuwählen – Seitenbereiche, einzelne Seiten oder alle paar Seiten – und Sie sind fertig. Es ist einer der praktischsten Online-PDF-Splitter, die Sie heute finden werden.",
      p2: "Das Teilen von PDFs wird nicht einfacher als das. Möchten Sie eine Seite aus einem riesigen Bericht herausziehen? Genervt von leeren Blättern oder Werbung, die alles durcheinanderbringen? Mit unserem Tool können Sie genau festlegen, welche Seiten Sie behalten möchten, und sie in separate Dateien oder kleinere Stapel umwandeln. Alles online – keine Downloads nötig. Mit unserem PDF-Splitter können Sie ein unhandliches Dokument in ordentliche, überschaubare Teile verwandeln, bereit zum Versenden per E-Mail, Speichern oder Teilen ohne Dateigrößenprobleme.",
      p3: "Unser Online-PDF-Splitter glänzt mit seinem einfachen Layout und robusten Optionen. Teilen Sie ein Lehrbuch in Kapitel oder schneiden Sie einen langen Vertrag in wichtige Teile ohne Aufwand. Die Drag-and-Drop-Funktion macht es reibungslos – einfach Datei ablegen und klicken, um loszulegen. Sie können Ihr PDF sogar vorher ansehen, um Seiten punktgenau auszuwählen, bevor Sie teilen. Und das Beste? Es ist kostenlos für Dateien bis zu 100 Seiten, sodass jeder sofort loslegen kann.",
      p4: "Warum unseren PDF-Splitter wählen? Er ist schnell, sicher und bietet viel Flexibilität. Ziehen Sie Seiten für eine Präsentation heraus, entfernen Sie Extras, um ein Dokument zu bereinigen, oder teilen Sie PDFs in mehrere Dateien für bessere Ordnung – alles direkt aus Ihrem Browser. Wir haben es optimiert, um bei Suchen wie 'PDF online teilen', 'Seiten löschen' und 'PDF-Seiten trennen' aufzutauchen, damit Sie uns genau dann finden, wenn Sie uns brauchen. Probieren Sie es heute aus und sehen Sie, wie reibungslos die PDF-Verwaltung sein kann!"
    },
    relatedTools: "Verwandte Tools",
    popular: {
      viewAll: "Alle Tools anzeigen"
    }
  },
  // PDFs zusammenführen-Seite
  mergePdf: {
    title: "PDF-Dateien online zusammenführen | Kostenloses PDF-Zusammenführungstool im Webbrowser",
    description: "Kombinieren Sie mehrere PDF-Dateien schnell und einfach zu einem einzigen Dokument mit unserem browserbasierten Zusammenführungstool, das auf allen Betriebssystemen funktioniert",
    intro: "Unser Online-PDF-Zusammenführungstool ermöglicht es Ihnen, mehrere Dokumente mit nur wenigen Klicks zu einer zusammengeführten Datei zu kombinieren. Keine Installation erforderlich - funktioniert direkt in Ihrem Webbrowser auf jedem Betriebssystem.",

    // How-to section
    howTo: {
      title: "Wie man PDF-Dateien im Browser zusammenführt",
      step1: {
        title: "Dateien hochladen",
        description: "Laden Sie die PDF-Dateien hoch, die Sie kombinieren möchten. Wählen Sie mehrere Dateien gleichzeitig von Ihrem Gerät aus oder ziehen Sie sie direkt in Ihren Webbrowser."
      },
      step2: {
        title: "Reihenfolge anpassen",
        description: "Ziehen Sie die Dateien per Drag-and-Drop, um sie in der gewünschten Reihenfolge für die endgültige zusammengeführte Datei anzuordnen. Unser Zusammenführungstool macht das Organisieren mehrerer PDFs intuitiv."
      },
      step3: {
        title: "Herunterladen",
        description: "Klicken Sie auf die Schaltfläche 'PDFs zusammenführen' und laden Sie Ihre kombinierte PDF-Datei direkt von jedem Webbrowser auf Ihr Gerät herunter."
      }
    },

    // Benefits section
    benefits: {
      title: "Vorteile unseres Online-PDF-Zusammenführungstools",
      compatibility: {
        title: "Funktioniert auf allen Geräten",
        description: "Unser webbrowserbasiertes PDF-Zusammenführungstool funktioniert perfekt auf Windows, macOS, Linux und mobilen Betriebssystemen ohne Installation."
      },
      privacy: {
        title: "Sicher & Privat",
        description: "Ihre Dokumente werden in Ihrem Webbrowser verarbeitet und nach der Zusammenführung automatisch gelöscht, sodass Ihre sensiblen Informationen privat bleiben."
      },
      simplicity: {
        title: "Benutzerfreundliche Oberfläche",
        description: "Die intuitive Drag-and-Drop-Oberfläche macht das Zusammenführen mehrerer PDF-Dateien einfach, selbst für Erstnutzer unseres Online-Tools."
      },
      quality: {
        title: "Hochwertige Ausgabe",
        description: "Unser Zusammenführungstool bewahrt die ursprüngliche Formatierung, Bilder und Textqualität in Ihrer zusammengeführten Datei und sorgt für professionelle Ergebnisse."
      }
    },

    // Use cases section
    useCases: {
      title: "Häufige Anwendungen für das Zusammenführen von PDFs",
      business: {
        title: "Geschäftsdokumente",
        description: "Kombinieren Sie Finanzberichte, Verträge und Präsentationen zu umfassender Dokumentation für Kunden und Stakeholder."
      },
      academic: {
        title: "Akademische Arbeiten",
        description: "Führen Sie Forschungspapiere, Zitate und Anhänge zu einer vollständigen akademischen Einreichung zusammen, die zur Überprüfung bereit ist."
      },
      personal: {
        title: "Persönliche Aufzeichnungen",
        description: "Kombinieren Sie Quittungen, Garantien und Bedienungsanleitungen zu organisierten digitalen Aufzeichnungen für einfache Referenz."
      },
      professional: {
        title: "Professionelle Portfolios",
        description: "Erstellen Sie beeindruckende Portfolios, indem Sie mehrere Arbeitsproben zu einem einzigen, leicht teilbaren Dokument zusammenführen."
      }
    },

    // FAQ section
    faq: {
      title: "Häufig gestellte Fragen",
      q1: {
        question: "Gibt es eine Begrenzung, wie viele PDFs ich mit Ihrem Online-Tool zusammenführen kann?",
        answer: "Mit unserem kostenlosen webbrowserbasierten Zusammenführungstool können Sie bis zu 20 PDF-Dateien auf einmal kombinieren. Für das Zusammenführen mehrerer größerer Chargen sollten Sie ein Upgrade auf unseren Premium-Plan in Betracht ziehen, der unbegrenzte Zusammenführungsoperationen ermöglicht."
      },
      q2: {
        question: "Bleiben meine PDF-Dateien privat, wenn ich Ihr Online-Zusammenführungstool verwende?",
        answer: "Ja, Ihre Privatsphäre hat für uns Priorität. Alle hochgeladenen Dateien werden sicher in unserem browserbasierten Zusammenführungstool verarbeitet und nach der Verarbeitung automatisch von unseren Servern gelöscht. Wir greifen niemals auf den Inhalt Ihrer Dokumente zu oder speichern ihn."
      },
      q3: {
        question: "Kann ich passwortgeschützte PDFs mit Ihrem Online-Tool zusammenführen?",
        answer: "Für passwortgeschützte PDFs müssen Sie diese zuerst mit unserem Online-Tool zum Entsperren von PDFs freischalten und dann zusammenführen. Unser browserbasiertes Zusammenführungstool wird Sie auffordern, wenn es geschützte Dokumente erkennt."
      },
      q4: {
        question: "Funktioniert Ihr Online-PDF-Zusammenführungstool auf allen Betriebssystemen?",
        answer: "Ja, unser webbrowserbasiertes PDF-Zusammenführungstool funktioniert auf allen wichtigen Betriebssystemen, einschließlich Windows, macOS, Linux, iOS und Android. Solange Sie einen modernen Webbrowser haben, können Sie PDFs ohne Softwareinstallation zusammenführen."
      },
      q5: {
        question: "Wie groß können die PDF-Dateien zum Zusammenführen sein?",
        answer: "Unser kostenloses Online-Zusammenführungstool unterstützt Dateien mit bis zu 100 MB pro Datei. Die kombinierte Größe aller zu fusionierenden Dateien sollte 300 MB nicht überschreiten, um eine optimale Leistung in Ihrem Webbrowser zu gewährleisten."
      },
      q6: {
        question: "Wird die zusammengeführte Datei alle Funktionen der ursprünglichen PDFs beibehalten?",
        answer: "Ja, unser fortschrittliches Zusammenführungstool bewahrt Text, Bilder, Formatierung, Hyperlinks und die meisten interaktiven Elemente aus den ursprünglichen PDFs in Ihrer endgültigen zusammengeführten Datei."
      }
    },

    // Tips section
    tips: {
      title: "Tipps zum effektiven Zusammenführen von PDFs",
      tip1: {
        title: "Vor dem Zusammenführen organisieren",
        description: "Benennen Sie Ihre Dateien numerisch um (z. B. 01_intro.pdf, 02_content.pdf), bevor Sie sie in unser Zusammenführungstool hochladen, um die Organisation zu erleichtern."
      },
      tip2: {
        title: "Große Dateien optimieren",
        description: "Verwenden Sie zuerst unser PDF-Komprimierungstool, wenn Sie mehrere große Dokumente zusammenführen, um eine bessere Leistung der endgültigen zusammengeführten Datei zu gewährleisten."
      },
      tip3: {
        title: "Vorschau überprüfen",
        description: "Verwenden Sie nach dem Anordnen Ihrer Dateien die Vorschaufunktion in unserem Online-Tool, um die Reihenfolge vor der Fertigstellung Ihres zusammengeführten PDFs zu überprüfen."
      },
      tip4: {
        title: "Lesezeichen in Betracht ziehen",
        description: "Für professionelle Dokumente sollten Sie in Betracht ziehen, Ihrer zusammengeführten Datei mit unserem PDF-Bearbeitungstool Lesezeichen hinzuzufügen, um die Navigation zu erleichtern."
      }
    },

    // Comparison section
    comparison: {
      title: "Warum unser Webbrowser-Zusammenführungstool wählen",
      point1: {
        title: "Keine Softwareinstallation",
        description: "Im Gegensatz zu Desktop-Anwendungen funktioniert unser Online-PDF-Zusammenführungstool direkt in Ihrem Webbrowser, ohne dass Software heruntergeladen oder installiert werden muss."
      },
      point2: {
        title: "Plattformübergreifende Kompatibilität",
        description: "Unser browserbasiertes Tool funktioniert auf allen Betriebssystemen, während Desktop-Alternativen oft nur bestimmte Plattformen unterstützen."
      },
      point3: {
        title: "Kostenlos und zugänglich",
        description: "Nutzen Sie unsere PDF-Zusammenführungsfunktionen kostenlos, im Vergleich zu teuren Desktop-Alternativen oder Abonnementdiensten."
      },
      point4: {
        title: "Regelmäßige Updates",
        description: "Unser Online-Zusammenführungstool wird kontinuierlich verbessert, ohne dass manuelle Updates von den Nutzern erforderlich sind."
      }
    },

    // UI elements and messages
    ui: {
      of: "von",
      files: "Dateien",
      filesToMerge: "Zu fusionierende Dateien",
      dragToReorder: "Ziehen zum Neuordnen",
      downloadReady: "Download bereit",
      downloadMerged: "Zusammengeführte Datei herunterladen",
      mergePdfs: "PDFs zusammenführen",
      processingMerge: "Ihre PDFs werden zusammengeführt...",
      successMessage: "PDFs erfolgreich zusammengeführt!",
      dragDropHere: "PDFs hierher ziehen und ablegen",
      or: "oder",
      browseFiles: "Dateien durchsuchen",
      fileLimit: "Bis zu 20 PDF-Dateien kombinieren",
      noPdfsSelected: "Keine PDFs ausgewählt",
      addMoreFiles: "Weitere Dateien hinzufügen",
      rearrangeMessage: "Ziehen Sie Dateien, um die Reihenfolge in Ihrem zusammengeführten PDF neu anzuordnen",
      removeFile: "Entfernen",
      filePreview: "Vorschau",
      startOver: "Neu starten",
      mergingInProgress: "Zusammenführung läuft...",
      pleaseWait: "Bitte warten Sie, während wir Ihre PDF-Dateien kombinieren",
      processingFile: "Verarbeitung",
      retry: "Zusammenführung erneut versuchen"
    },
  },

  // OCR-Seite
  ocr: {
    title: "OCR-Extraktion: Einfache Texterkennung",
    description: "Verwandeln Sie gescannte PDFs und Bilddateien in editierbaren Text mit fortschrittlicher OCR-Software und maschinellem Lernen",
    howTo: {
      title: "Wie die OCR-Extraktion funktioniert",
      step1: { title: "Hochladen", description: "Laden Sie Ihre gescannte PDF oder Bilddatei in den Bild-zu-Text-Konverter hoch." },
      step2: { title: "OCR-Tool konfigurieren", description: "Wählen Sie Sprache, Seitenbereich und erweiterte Einstellungen für optimale Texterkennung." },
      step3: { title: "Text extrahieren", description: "Kopieren Sie den extrahierten Text oder laden Sie ihn als .txt-Datei mit unserem Bild-zu-Text-Konverter herunter." }
    },
    faq: {
      title: "Häufig gestellte Fragen",
      questions: {
        accuracy: { question: "Wie genau ist die OCR-Extraktionstechnologie?", answer: "Unsere OCR-Software erreicht 90-99% Genauigkeit bei klar gedrucktem Text in gut gescannten Dokumenten. Die Genauigkeit kann bei schlechten Bilddateien oder ungewöhnlichen Schriften abnehmen." },
        languages: { question: "Welche Sprachen werden unterstützt?", answer: "Wir unterstützen über 100 Sprachen, einschließlich Englisch, Französisch, Deutsch, Spanisch, Chinesisch, Japanisch, Arabisch, Russisch und viele mehr." },
        recognition: { question: "Warum wird mein Text nicht korrekt erkannt?", answer: "Mehrere Faktoren können die Texterkennung beeinflussen: Dokumentqualität, Auflösung, Kontrast, komplexe Layouts, Handschrift oder die falsche Sprachauswahl." },
        pageLimit: { question: "Gibt es eine Begrenzung für die Anzahl der Seiten?", answer: "Für kostenlose Nutzer beträgt das Limit 50 Seiten pro PDF. Premium-Nutzer können PDFs mit bis zu 500 Seiten verarbeiten." },
        security: { question: "Sind meine Daten während der OCR-Verarbeitung sicher?", answer: "Ja, Ihre Sicherheit hat Priorität. Alle hochgeladenen Dateien werden auf sicheren Servern verarbeitet und nach der Verarbeitung automatisch gelöscht." }
      }
    },
    relatedTools: "Verwandte OCR- und PDF-Tools",
    processing: { title: "Verarbeitung mit OCR-Software", message: "Die Texterkennung kann je nach Dateigröße und Komplexität einige Minuten dauern" },
    results: { title: "Ergebnisse des extrahierten Textes", copy: "Kopieren", download: "Download .txt" },
    languages: { english: "Englisch", french: "Französisch", german: "Deutsch", spanish: "Spanisch", chinese: "Chinesisch", japanese: "Japanisch", arabic: "Arabisch", russian: "Russisch" },
    whatIsOcr: {
      title: "Was ist OCR-Extraktion?",
      description: "Optische Zeichenerkennung (OCR) ist eine durch maschinelles Lernen unterstützte Technologie, die gescannte Dokumente, PDFs und Bilddateien in editierbaren, durchsuchbaren Text umwandelt.",
      explanation: "Der Bild-zu-Text-Konverter analysiert die Struktur des Dokumentbildes, erkennt Zeichen und Textelemente und wandelt sie in ein maschinenlesbares Format um.",
      extractionList: { scannedPdfs: "Gescannte PDFs, bei denen der Text als Bild vorliegt", imageOnlyPdfs: "Nur-Bild-PDFs ohne Textschicht", embeddedImages: "PDFs mit eingebetteten Bildern mit Text", textCopyingIssues: "Dokumente, bei denen das direkte Kopieren von Text nicht funktioniert" }
    },
    whenToUse: {
      title: "Wann sollte man einen Bild-zu-Text-Extraktor verwenden",
      idealFor: "Ideal für:",
      idealForList: { scannedDocuments: "Gescannte Dokumente als PDFs gespeichert", oldDocuments: "Alte Dokumente ohne digitale Textschicht", textSelectionIssues: "PDFs, bei denen Textauswahl/Kopieren nicht funktioniert", textInImages: "Bilddateien mit zu extrahierendem Text", searchableArchives: "Erstellung durchsuchbarer Archive aus gescannten Dokumenten" },
      notNecessaryFor: "Nicht notwendig für:",
      notNecessaryForList: { digitalPdfs: "Native digitale PDFs mit auswählbarem Text", createdDigitally: "PDFs, die direkt aus digitalen Dokumenten erstellt wurden", copyPasteAvailable: "Dokumente, bei denen Kopieren und Einfügen bereits möglich ist", formatPreservation: "Dateien, die Formatbewahrung benötigen (nutzen Sie stattdessen unsere PDF-zu-DOCX-Konvertierung)" }
    },
    limitations: {
      title: "Einschränkungen und Tipps für das OCR-Tool",
      description: "Obwohl unsere OCR-Software leistungsstark ist, gibt es einige Einschränkungen, die zu beachten sind:",
      factorsAffecting: "Faktoren, die die Texterkennung beeinflussen:",
      factorsList: { documentQuality: "Dokumentqualität (Auflösung, Kontrast)", complexLayouts: "Komplexe Layouts und Formatierungen", handwrittenText: "Handgeschriebener Text (eingeschränkte Erkennung)", specialCharacters: "Sonderzeichen und Symbole", multipleLanguages: "Mehrere Sprachen in einem Dokument" },
      tipsForBest: "Tipps für beste Ergebnisse:",
      tipsList: { highQualityScans: "Verwenden Sie hochwertige Scans (300 DPI oder höher)", correctLanguage: "Wählen Sie die richtige Sprache für Ihr Dokument", enhanceScannedImages: "Aktivieren Sie 'Gescannte Bilder verbessern' für bessere Genauigkeit", smallerPageRanges: "Verarbeiten Sie kleinere Seitenbereiche bei großen Dokumenten", reviewText: "Überprüfen und korrigieren Sie den extrahierten Text danach" }
    },
    options: { scope: "Zu extrahierende Seiten", all: "Alle Seiten", custom: "Bestimmte Seiten", pages: "Seitenzahlen", pagesHint: "Z.B. 1,3,5-9", enhanceScanned: "Gescannte Bilder verbessern", enhanceScannedHint: "Bilder vorverarbeiten, um die OCR-Genauigkeit zu verbessern (empfohlen für gescannte Dokumente)", preserveLayout: "Layout beibehalten", preserveLayoutHint: "Versuchen Sie, das ursprüngliche Layout mit Absätzen und Zeilenumbrüchen beizubehalten" },
    ocrTool: "OCR-Extraktions-Tool",
    ocrToolDesc: "Verwandeln Sie gescannte Dokumente und Bilddateien in editierbaren Text mit unserem Bild-zu-Text-Konverter",
    uploadPdf: "Dateien für OCR-Extraktion hochladen",
    dragDrop: "Ziehen Sie Ihre PDF- oder Bilddatei hierher oder klicken Sie zum Durchsuchen",
    selectPdf: "Datei auswählen",
    uploading: "Hochladen...",
    maxFileSize: "Maximale Dateigröße: 50MB",
    invalidFile: "Ungültiger Dateityp",
    invalidFileDesc: "Bitte wählen Sie eine PDF- oder unterstützte Bilddatei",
    fileTooLarge: "Datei zu groß",
    fileTooLargeDesc: "Maximale Dateigröße beträgt 50MB",
    noFile: "Keine Datei ausgewählt",
    noFileDesc: "Bitte wählen Sie eine Datei zur Texterkennung",
    changeFile: "Datei ändern",
    languageLabel: "Dokumentsprache",
    selectLanguage: "Sprache auswählen",
    pageRange: "Seitenbereich",
    allPages: "Alle Seiten",
    specificPages: "Bestimmte Seiten",
    pageRangeExample: "z.B. 1-3, 5, 7-9",
    pageRangeInfo: "Geben Sie einzelne Seiten oder Bereiche durch Kommas getrennt ein",
    preserveLayout: "Layout beibehalten",
    preserveLayoutDesc: "Versuchen Sie, die Dokumentstruktur und Formatierung beizubehalten",
    extractText: "Text extrahieren",
    extractingText: "Text wird extrahiert...",
    processingPdf: "Ihre Datei wird verarbeitet",
    processingInfo: "Dies kann je nach Dateigröße und Komplexität einige Minuten dauern",
    analyzing: "Inhalt analysieren",
    preprocessing: "Seiten vorverarbeiten",
    recognizing: "Text erkennen",
    extracting: "Inhalt extrahieren",
    finalizing: "Ergebnisse finalisieren",
    finishing: "Abschließen",
    extractionComplete: "Text Extraktion abgeschlossen",
    extractionCompleteDesc: "Ihr Text wurde erfolgreich mit unserem Bild-zu-Text-Extraktor extrahiert",
    extractionError: "Text Extraktion fehlgeschlagen",
    extractionFailed: "Text konnte nicht extrahiert werden",
    unknownError: "Ein unbekannter Fehler ist aufgetreten",
    textCopied: "Text in die Zwischenablage kopiert",
    copyFailed: "Text konnte nicht kopiert werden",
    textPreview: "Textvorschau",
    rawText: "Rohtext",
    extractedText: "Extrahierter Text",
    previewDesc: "Vorschau des extrahierten Textes mit Formatierung",
    rawTextOutput: "Rohtext-Ausgabe",
    rawTextDesc: "Reiner Text ohne Formatierung",
    noTextFound: "Kein Text in der Datei gefunden",
    copyText: "Text kopieren",
    downloadText: "Text herunterladen",
    processAnother: "Eine weitere Datei verarbeiten",
    supportedLanguages: "Unterstützt über 15 Sprachen, einschließlich Englisch, Spanisch, Französisch, Deutsch, Chinesisch, Japanisch und mehr. Wählen Sie die passende Sprache für bessere Genauigkeit."
  },

  // PDF schützen-Seite
  protectPdf: {
    title: "PDF mit Passwort schützen",
    description: "Sichern Sie Ihre PDF-Dokumente mit Passwortschutz und benutzerdefinierten Zugriffsberechtigungen",
    howTo: {
      title: "So schützen Sie Ihr PDF",
      step1: {
        title: "Hochladen",
        description: "Laden Sie die PDF-Datei hoch, die Sie mit einem Passwort schützen möchten."
      },
      step2: {
        title: "Sicherheitsoptionen festlegen",
        description: "Erstellen Sie ein Passwort und passen Sie Berechtigungen für Drucken, Kopieren und Bearbeiten an."
      },
      step3: {
        title: "Herunterladen",
        description: "Laden Sie Ihre passwortgeschützte PDF-Datei zum sicheren Teilen herunter."
      }
    },
    why: {
      title: "Warum sollten Sie Ihre PDFs schützen?",
      confidentiality: {
        title: "Vertraulichkeit",
        description: "Stellen Sie sicher, dass nur autorisierte Personen mit dem Passwort Ihre sensiblen Dokumente öffnen und anzeigen können."
      },
      controlledAccess: {
        title: "Kontrollierter Zugriff",
        description: "Legen Sie spezifische Berechtigungen fest, um zu bestimmen, was Empfänger mit Ihrem Dokument tun können, wie z.B. Drucken oder Bearbeiten."
      },
      authorizedDistribution: {
        title: "Autorisierte Verteilung",
        description: "Kontrollieren Sie, wer auf Ihr Dokument zugreifen kann, wenn Sie Verträge, Forschungsergebnisse oder geistiges Eigentum teilen."
      },
      documentExpiration: {
        title: "Dokumentablauf",
        description: "Passwortschutz fügt eine zusätzliche Sicherheitsebene für zeitkritische Dokumente hinzu, die nicht unbegrenzt zugänglich sein sollten."
      }
    },
    security: {
      title: "PDF-Sicherheit verstehen",
      passwords: {
        title: "Benutzerpasswort vs. Besitzerpasswort",
        user: "Benutzerpasswort: Erforderlich, um das Dokument zu öffnen. Ohne dieses Passwort kann niemand den Inhalt anzeigen.",
        owner: "Besitzerpasswort: Steuert Berechtigungen. Mit unserem Tool setzen wir beide Passwörter aus Gründen der Einfachheit gleich."
      },
      encryption: {
        title: "Verschlüsselungsstufen",
        aes128: "128-Bit AES: Bietet gute Sicherheit und ist kompatibel mit Acrobat Reader 7 und späteren Versionen.",
        aes256: "256-Bit AES: Bietet stärkere Sicherheit, erfordert jedoch Acrobat Reader X (10) oder spätere Versionen."
      },
      permissions: {
        title: "Berechtigungskontrollen",
        printing: {
          title: "Drucken",
          description: "Steuert, ob das Dokument gedruckt werden kann und in welcher Qualität."
        },
        copying: {
          title: "Kopieren von Inhalten",
          description: "Steuert, ob Text und Bilder ausgewählt und in die Zwischenablage kopiert werden können."
        },
        editing: {
          title: "Bearbeiten",
          description: "Steuert Dokumentänderungen, einschließlich Anmerkungen, Formularausfüllen und Inhaltsänderungen."
        }
      }
    },
    form: {
      password: "Passwort",
      confirmPassword: "Passwort bestätigen",
      encryptionLevel: "Verschlüsselungsstufe",
      permissions: {
        title: "Zugriffsberechtigungen",
        allowAll: "Alles erlauben (nur Passwort zum Öffnen)",
        restricted: "Eingeschränkter Zugriff (benutzerdefinierte Berechtigungen)"
      },
      allowedActions: "Erlaubte Aktionen:",
      allowPrinting: "Drucken erlauben",
      allowCopying: "Kopieren von Text und Bildern erlauben",
      allowEditing: "Bearbeiten und Anmerkungen erlauben"
    },
    bestPractices: {
      title: "Beste Praktiken für den Passwortschutz",
      dos: "Empfohlene Vorgehensweisen",
      donts: "Nicht empfohlene Vorgehensweisen",
      dosList: [
        "Verwenden Sie starke, eindeutige Passwörter mit einer Mischung aus Buchstaben, Zahlen und Sonderzeichen",
        "Speichern Sie Passwörter sicher in einem Passwort-Manager",
        "Teilen Sie Passwörter über sichere Kanäle, die vom PDF getrennt sind",
        "Verwenden Sie 256-Bit-Verschlüsselung für hochsensible Dokumente"
      ],
      dontsList: [
        "Verwenden Sie einfache, leicht zu erratende Passwörter wie „password123“ oder „1234“",
        "Senden Sie das Passwort in derselben E-Mail wie das PDF",
        "Verwenden Sie dasselbe Passwort für alle Ihre geschützten PDFs",
        "Verlassen Sie sich ausschließlich auf den Passwortschutz für extrem sensible Informationen"
      ]
    },
    faq: {
      encryptionDifference: {
        question: "Was ist der Unterschied zwischen den Verschlüsselungsstufen?",
        answer: "Wir bieten 128-Bit- und 256-Bit-AES-Verschlüsselung an. 128-Bit ist kompatibel mit älteren PDF-Lesern (Acrobat 7 und später), während 256-Bit stärkere Sicherheit bietet, aber neuere Leser (Acrobat X und später) erfordert."
      },
      removeProtection: {
        question: "Kann ich den Passwortschutz später entfernen?",
        answer: "Ja, Sie können unser PDF-Entsperren-Tool verwenden, um den Passwortschutz von Ihren PDF-Dateien zu entfernen, aber Sie müssen das aktuelle Passwort kennen, um dies zu tun."
      },
      securityStrength: {
        question: "Wie sicher ist der Passwortschutz?",
        answer: "Unser Tool verwendet die branchenübliche AES-Verschlüsselung. Die Sicherheit hängt von der Stärke Ihres Passworts und der gewählten Verschlüsselungsstufe ab. Wir empfehlen die Verwendung von starken, eindeutigen Passwörtern mit einer Mischung aus Zeichen."
      },
      contentQuality: {
        question: "Beeinflusst der Passwortschutz den Inhalt oder die Qualität des PDFs?",
        answer: "Nein, der Passwortschutz fügt Ihrem Dokument nur Sicherheit hinzu und verändert den Inhalt, das Layout oder die Qualität Ihres PDFs in keiner Weise."
      },
      batchProcessing: {
        question: "Kann ich mehrere PDFs gleichzeitig schützen?",
        answer: "Derzeit verarbeitet unser Tool eine PDF-Datei gleichzeitig. Für die Stapelverarbeitung mehrerer Dateien sollten Sie unsere API oder Premium-Lösungen in Betracht ziehen."
      }
    },
    protecting: "Schützen...",
    protected: "PDF erfolgreich geschützt!",
    protectedDesc: "Ihre PDF-Datei wurde verschlüsselt und passwortgeschützt."
  },
  watermarkPdf: {
    title: "Wasserzeichen zu PDF hinzufügen",
    description: "Fügen Sie benutzerdefinierte Text- oder Bildwasserzeichen zu Ihren PDF-Dokumenten hinzu, um Schutz, Branding oder Identifikation zu gewährleisten.",
    textWatermark: "Text-Wasserzeichen",
    imageWatermark: "Bild-Wasserzeichen",
    privacyNote: "Ihre Dateien werden sicher verarbeitet. Alle Uploads werden nach der Bearbeitung automatisch gelöscht.",
    headerTitle: "Wasserzeichen zu PDF hinzufügen",
    headerDescription: "Fügen Sie benutzerdefinierte Text- oder Bildwasserzeichen zu Ihren PDF-Dokumenten für Branding, Urheberschutz und Dokumentklassifizierung hinzu.",
    invalidFileType: "Ungültiger Dateityp",
    selectPdfFile: "Bitte wählen Sie eine PDF-Datei aus",
    fileTooLarge: "Datei zu groß",
    maxFileSize: "Maximale Dateigröße beträgt 50 MB",
    invalidImageType: "Ungültiger Bildtyp",
    supportedFormats: "Unterstützte Formate: PNG, JPG, SVG",
    imageTooLarge: "Bild zu groß",
    maxImageSize: "Maximale Bildgröße beträgt 5 MB",
    noFileSelected: "Keine Datei ausgewählt",
    noImageSelected: "Kein Wasserzeichenbild ausgewählt",
    selectWatermarkImage: "Bitte wählen Sie ein Bild als Wasserzeichen aus",
    noTextEntered: "Kein Wasserzeichentext eingegeben",
    enterWatermarkText: "Bitte geben Sie Text als Wasserzeichen ein",
    success: "Wasserzeichen erfolgreich hinzugefügt",
    successDesc: "Ihr PDF wurde mit einem Wasserzeichen versehen und ist zum Download bereit",
    failed: "Wasserzeichen konnte nicht hinzugefügt werden",
    unknownError: "Ein unbekannter Fehler ist aufgetreten",
    unknownErrorDesc: "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut",
    uploadTitle: "PDF zum Wasserzeichen hinzufügen hochladen",
    uploadDesc: "Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Durchsuchen",
    uploading: "Hochladen...",
    selectPdf: "PDF-Datei auswählen",
    maxSize: "Maximale Dateigröße: 50 MB",
    change: "Datei ändern",
    commonOptions: "Wasserzeichen-Einstellungen",
    position: "Position",
    center: "Zentriert",
    tile: "Kacheln",
    custom: "Benutzerdefiniert",
    applyToPages: "Auf Seiten anwenden",
    all: "Alle Seiten",
    even: "Gerade Seiten",
    odd: "Ungerade Seiten",
    customPages: "Benutzerdefinierte Seiten",
    pagesFormat: "Geben Sie Seitenzahlen durch Kommas getrennt oder Bereiche mit Bindestrichen ein (z. B. 1,3,5-10)",
    processing: "Verarbeitung...",
    addWatermark: "Wasserzeichen hinzufügen",
    adding: "Wasserzeichen wird hinzugefügt",
    pleaseWait: "Bitte warten Sie, während wir Ihr Dokument verarbeiten",
    download: "PDF herunterladen",
    newWatermark: "Ein weiteres Wasserzeichen hinzufügen",
    text: {
      text: "Wasserzeichentext",
      placeholder: "z. B. VERTRAULICH, ENTWURF usw.",
      color: "Textfarbe",
      font: "Schriftart",
      selectFont: "Schriftart auswählen",
      size: "Schriftgröße",
      opacity: "Deckkraft",
      rotation: "Rotation",
      preview: "Vorschau"
    },
    image: {
      title: "Wasserzeichenbild",
      upload: "Laden Sie ein Bild als Wasserzeichen hoch",
      select: "Bild auswählen",
      formats: "Unterstützte Formate: PNG, JPEG, SVG",
      change: "Bild ändern",
      scale: "Skalierung",
      opacity: "Deckkraft",
      rotation: "Rotation"
    },
    positionX: "Position X",
    positionY: "Position Y",
    positions: {
      topLeft: "Oben links",
      topRight: "Oben rechts",
      bottomLeft: "Unten links",
      bottomRight: "Unten rechts",
      center: "Mitte",
      tile: "Kacheln",
      custom: "Benutzerdefiniert"
    },
    howTo: {
      title: "Wie man ein Wasserzeichen hinzufügt",
      step1: { title: "Ihr PDF hochladen", description: "Wählen und laden Sie die PDF-Datei hoch, die Sie mit einem Wasserzeichen versehen möchten" },
      step2: { title: "Wasserzeichen anpassen", description: "Wählen Sie zwischen Text- oder Bildwasserzeichen und passen Sie das Erscheinungsbild an" },
      step3: { title: "PDF mit Wasserzeichen herunterladen", description: "Verarbeiten Sie Ihre Datei und laden Sie das PDF mit Wasserzeichen herunter" }
    },
    why: {
      title: "Warum Wasserzeichen hinzufügen",
      copyright: { title: "Urheberschutz", description: "Schützen Sie Ihr geistiges Eigentum durch Hinzufügen von Urheberrechtsvermerken und Eigentumsinformationen" },
      branding: { title: "Branding & Identität", description: "Verstärken Sie Ihre Markenidentität durch Hinzufügen von Logos oder Markentext zu verteilten Dokumenten" },
      classification: { title: "Dokumentklassifizierung", description: "Markieren Sie Dokumente als Entwurf, Vertraulich oder Final, um ihren Status anzuzeigen" },
      tracking: { title: "Dokumentverfolgung", description: "Fügen Sie eindeutige Kennzeichen hinzu, um die Dokumentverteilung zu verfolgen und Lecks zu identifizieren" }
    },
    types: {
      title: "Wasserzeichentypen & Optionen",
      text: {
        title: "Text-Wasserzeichen",
        description: "Passen Sie Text-Wasserzeichen mit verschiedenen Optionen an:",
        options: {
          text: "Benutzerdefinierter Textinhalt (mehrzeilig unterstützt)",
          font: "Schriftfamilie, Größe und Farbe",
          rotation: "Rotationswinkel (0-360 Grad)",
          opacity: "Deckkraftniveau (transparent bis vollständig sichtbar)",
          position: "Position (zentriert, gekachelt, benutzerdefinierte Platzierung)"
        }
      },
      image: {
        title: "Bild-Wasserzeichen",
        description: "Fügen Sie Bild-Wasserzeichen mit diesen Anpassungen hinzu:",
        options: {
          upload: "Laden Sie Ihr eigenes Logo oder Bild hoch",
          scale: "Skalieren und Größe anpassen",
          rotation: "Rotationsoptionen",
          opacity: "Transparenzsteuerung",
          position: "Positionsanpassung"
        }
      }
    },
    faq: {
      title: "Häufig gestellte Fragen",
      removable: { question: "Können Wasserzeichen aus einem PDF entfernt werden?", answer: "Unsere Standard-Wasserzeichen sind halbpermanent und schwer ohne spezialisierte Software zu entfernen. Sie sind jedoch nicht vollständig manipulationssicher. Für sicherere, manipulationsresistente Wasserzeichen sollten Sie unseren Pro-Plan in Betracht ziehen, der erweiterte Sicherheitsfunktionen bietet." },
      printing: { question: "Erscheinen Wasserzeichen beim Drucken des Dokuments?", answer: "Ja, Wasserzeichen erscheinen beim Drucken. Sie können die Deckkraft steuern, um sie für gedruckte Dokumente subtiler zu gestalten." },
      pages: { question: "Kann ich nur bestimmte Seiten mit einem Wasserzeichen versehen?", answer: "Ja, unser Pro-Plan erlaubt es, Wasserzeichen auf bestimmte Seiten anzuwenden. Sie können einzelne Seiten oder Bereiche auswählen." },
      formats: { question: "Welche Bildformate werden für Bild-Wasserzeichen unterstützt?", answer: "Wir unterstützen PNG, JPG/JPEG und SVG. PNG wird für Logos mit Transparenz empfohlen." },
      multiple: { question: "Kann ich mehrere Wasserzeichen zu einem Dokument hinzufügen?", answer: "Pro-Nutzer können mehrere Wasserzeichen hinzufügen, z. B. ein Logo und einen Text. Kostenlose Nutzer sind auf ein Wasserzeichen beschränkt." },
      q1: { question: "Ist meine PDF-Datei sicher?", answer: "Ja, alle Uploads werden sicher verarbeitet und nach der Bearbeitung automatisch gelöscht." },
      q2: { question: "Welche Arten von Wasserzeichen kann ich hinzufügen?", answer: "Text-Wasserzeichen mit anpassbaren Schriftarten oder Bild-Wasserzeichen mit PNG, JPG oder SVG." },
      q3: { question: "Kann ich ein Wasserzeichen nach dem Hinzufügen entfernen?", answer: "Nach dem Hinzufügen und Herunterladen wird es dauerhaft Teil des PDFs." },
      q4: { question: "Gibt es eine Dateigrößenbeschränkung?", answer: "Ja, die maximale Größe für PDFs beträgt 50 MB, für Bilder 5 MB." }
    },
    bestPractices: {
      title: "Best Practices für Wasserzeichen",
      dos: "Do's",
      donts: "Don'ts",
      dosList: [
        "Verwenden Sie halbtransparente Wasserzeichen, um Inhalte nicht zu verdecken",
        "Erwägen Sie diagonale Wasserzeichen für bessere Abdeckung",
        "Testen Sie Ihr Wasserzeichen auf einer Probeseite",
        "Verwenden Sie kontrastierende Farben für bessere Sichtbarkeit",
        "Fügen Sie das Copyright-Symbol © für rechtlichen Schutz hinzu"
      ],
      dontsList: [
        "Verwenden Sie keine zu dunklen oder undurchsichtigen Wasserzeichen",
        "Platzieren Sie Wasserzeichen nicht über wichtigen Text",
        "Verwenden Sie keinen zu kleinen Text, der unleserlich wird",
        "Verlassen Sie sich nicht allein auf Wasserzeichen für Sicherheit",
        "Verwenden Sie keine pixeligen, niedrigauflösenden Bilder"
      ]
    },
    relatedTools: {
      title: "Verwandte Tools",
      protect: "PDF schützen",
      sign: "PDF signieren",
      edit: "PDF bearbeiten",
      ocr: "PDF OCR",
      viewAll: "Alle Tools anzeigen"
    }
  },
  compressPdf: {
    title: "PDF-Dateien komprimieren",
    description: "Reduzieren Sie mühelos die Größe von PDF-Dateien bei gleichzeitiger Beibehaltung der Dokumentqualität",
    quality: {
      high: "Hohe Qualität",
      highDesc: "Minimale Komprimierung, beste visuelle Qualität",
      balanced: "Ausgewogen",
      balancedDesc: "Gute Komprimierung mit minimalem visuellen Verlust",
      maximum: "Maximale Komprimierung",
      maximumDesc: "Höchstes Kompressionsverhältnis, kann die visuelle Qualität reduzieren"
    },
    processing: {
      title: "Verarbeitungsoptionen",
      processAllTogether: "Alle Dateien gleichzeitig verarbeiten",
      processSequentially: "Dateien nacheinander verarbeiten"
    },
    status: {
      uploading: "Wird hochgeladen...",
      compressing: "Wird komprimiert...",
      completed: "Abgeschlossen",
      failed: "Fehlgeschlagen"
    },
    results: {
      title: "Zusammenfassung der Kompressionsergebnisse",
      totalOriginal: "Gesamtes Original",
      totalCompressed: "Gesamte Komprimierung",
      spaceSaved: "Eingesparter Speicherplatz",
      averageReduction: "Durchschnittliche Reduzierung",
      downloadAll: "Alle komprimierten Dateien als ZIP herunterladen"
    },
    of: "von",
    files: "Dateien",
    filesToCompress: "Zu komprimierende Dateien",
    compressAll: "Dateien komprimieren",
    qualityPlaceholder: "Komprimierungsqualität auswählen",
    reduction: "Reduzierung",
    zipDownloadSuccess: "Alle komprimierten Dateien wurden erfolgreich heruntergeladen",
    overallProgress: "Gesamtfortschritt",
    reducedBy: "wurde reduziert um",
    success: "Komprimierung erfolgreich",
    error: {
      noFiles: "Bitte wählen Sie PDF-Dateien zum Komprimieren aus",
      noCompressed: "Keine komprimierten Dateien zum Herunterladen verfügbar",
      downloadZip: "Fehler beim Herunterladen des ZIP-Archivs",
      generic: "Fehler beim Komprimieren der PDF-Datei",
      unknown: "Ein unbekannter Fehler ist aufgetreten",
      failed: "Fehler beim Komprimieren Ihrer Datei"
    },
    howTo: {
      title: "Wie man PDF-Dateien komprimiert",
      step1: {
        title: "PDF hochladen",
        description: "Laden Sie die großen PDF-Dateien hoch, die Sie komprimieren möchten. Unser kostenloser PDF-Kompressor unterstützt Dateien bis zu 100 MB und funktioniert auf Windows, Linux und anderen Plattformen."
      },
      step2: {
        title: "Qualität wählen",
        description: "Wählen Sie Ihre bevorzugte Komprimierungsstufe, um die Dateigröße zu reduzieren, ohne die Qualität zu verlieren. Wählen Sie den besten Modus basierend darauf, wie stark Sie eine PDF-Datei komprimieren möchten."
      },
      step3: {
        title: "Herunterladen",
        description: "Laden Sie Ihre komprimierte PDF-Datei herunter. Erhalten Sie eine kleinere Dateigröße, die perfekt für die Online-Weitergabe oder E-Mail-Anhänge ist."
      }
    },
    why: {
      title: "Warum PDFs komprimieren?",
      uploadSpeed: {
        title: "Blitzschnelle Uploads",
        description: "Komprimierte PDF-Dateien werden schneller hochgeladen, insbesondere große PDF-Dateien, und helfen Ihnen, Dokumente online ohne Verzögerung zu teilen."
      },
      emailFriendly: {
        title: "E-Mail-freundlich",
        description: "Reduzieren Sie die Dateigröße, damit Ihre PDFs in die Größenbeschränkungen von E-Mails passen. Unser PDF-Kompressor stellt eine einfache Weitergabe ohne Qualitätsverlust sicher."
      },
      storage: {
        title: "Speichereffizienz",
        description: "Sparen Sie Speicherplatz auf Ihrem Gerät oder in der Cloud, indem Sie unseren PDF-Kompressor verwenden, um große PDFs in kleinere, platzsparende Dateien zu verkleinern."
      },
      quality: {
        title: "Beibehaltende Qualität",
        description: "Komprimieren Sie PDFs, ohne die Qualität zu beeinträchtigen. Unsere intelligenten Modi behalten eine hohe visuelle Klarheit bei, während die Dateigröße verringert wird."
      }
    },
    faq: {
      title: "Häufig gestellte Fragen",
      howMuch: {
        question: "Wie stark können PDF-Dateien komprimiert werden?",
        answer: "Die meisten großen PDF-Dateien können um 20-80 % komprimiert werden, abhängig vom Inhalt. Unser PDF-Kompressor ist für verschiedene Anwendungsfälle optimiert und hilft Ihnen, die Dateigröße effektiv zu reduzieren — insbesondere für PDFs mit vielen Bildern."
      },
      quality: {
        question: "Beeinträchtigt die Komprimierung die Qualität meiner PDF?",
        answer: "Unser Tool gibt Ihnen die Wahl: Komprimieren Sie eine PDF im verlustfreien Modus ohne sichtbaren Unterschied oder wählen Sie eine hohe Komprimierung für eine maximale Reduzierung der Dateigröße. Sie können eine kostenlose PDF-Datei komprimieren, ohne die wesentliche Qualität zu verlieren."
      },
      secure: {
        question: "Sind meine PDF-Daten bei der Komprimierung sicher?",
        answer: "Ja, Ihre Daten sind sicher. Alle PDF-Dateien werden sicher online verarbeitet und nach 1 Stunden automatisch gelöscht. Egal, ob Sie Windows oder Linux verwenden, Ihre Datei ist verschlüsselt und wird niemals weitergegeben."
      },
      fileLimits: {
        question: "Welche Dateigrößenbeschränkungen gibt es?",
        answer: "Kostenlose Benutzer können PDF-Dateien bis zu 10 MB komprimieren. Premium-Pläne unterstützen bis zu 500 MB pro Datei. Egal, ob Sie eine oder mehrere PDFs komprimieren, unser Tool verarbeitet große PDF-Dateien mit Leichtigkeit."
      },
      batch: {
        question: "Kann ich mehrere PDFs gleichzeitig komprimieren?",
        answer: "Ja, Sie können PDFs stapelweise komprimieren. Laden Sie mehrere Dateien hoch und lassen Sie unseren PDF-Kompressor die Größe jeder Datei effizient in einer einzigen Sitzung reduzieren — ideal für Einzelpersonen und Teams."
      }
    },
    modes: {
      title: "Komprimierungsmodi",
      moderate: {
        title: "Mäßige Komprimierung",
        description: "Ein ausgewogener Modus, der PDF-Dateien komprimiert, ohne die Qualität zu verlieren. Perfekt für die Online-Weitergabe oder Archivierung von PDFs bei guter visueller Qualität."
      },
      high: {
        title: "Hohe Komprimierung",
        description: "Reduzieren Sie die Dateigröße aggressiv mit merklicher Komprimierung. Ideal zum schnellen Verkleinern großer PDF-Dateien — am besten, wenn eine kleinere Größe wichtiger ist als eine hohe Auflösung."
      },
      lossless: {
        title: "Verlustfreie Komprimierung",
        description: "Komprimieren Sie PDFs, indem Sie unnötige Daten bereinigen, und reduzieren Sie die Dateigröße, ohne das Aussehen zu beeinträchtigen — die beste Option, wenn Qualität am wichtigsten ist."
      }
    },
    bestPractices: {
      title: "Beste Praktiken für die PDF-Komprimierung",
      dos: "Do's",
      donts: "Don'ts",
      dosList: [
        "Komprimieren Sie Bilder vor dem Erstellen von PDFs für die besten Ergebnisse",
        "Wählen Sie die geeignete Komprimierungsstufe für Ihre Bedürfnisse",
        "Behalten Sie Originaldateien als Backups vor der Komprimierung bei",
        "Verwenden Sie verlustfreie Komprimierung für wichtige Dokumente",
        "Entfernen Sie unnötige Seiten, um die Dateigröße weiter zu reduzieren"
      ],
      dontsList: [
        "Überkomprimieren Sie keine Dokumente, die zum Drucken benötigt werden",
        "Komprimieren Sie keine rechtlichen oder archivierten Dokumente, wenn jedes Detail wichtig ist",
        "Komprimieren Sie bereits stark komprimierte PDFs nicht wiederholt",
        "Erwarten Sie keine großen Reduzierungen für PDFs, die hauptsächlich Text enthalten",
        "Komprimieren Sie nicht, wenn die Dateigröße kein Problem darstellt"
      ]
    },
    relatedTools: {
      title: "Verwandte Tools",
      merge: "PDF zusammenführen",
      split: "PDF teilen",
      pdfToWord: "PDF zu Word",
      pdfToJpg: "PDF zu JPG",
      viewAll: "Alle Tools anzeigen"
    }
  },

  // PDF entsperren
  unlockPdf: {
    title: "PDF-Dateien einfach mit unserem PDF-Entsperrer entsperren",
    description: "Entfernen Sie PDF-Passwörter und schützen Sie PDF-Dateien schnell mit unserem Online-PDF-Entsperrungstool. Entsperren Sie PDFs, um eine ungeschützte PDF-Datei auf jedem Betriebssystem zu erstellen.",
    metaDescription: "Entsperren Sie PDF-Dateien mühelos mit unserem PDF-Entsperrer. Entfernen Sie das PDF-Berechtigungskennwort, schützen Sie Online-PDFs und laden Sie Ihre entsperrte Datei sicher herunter.",
    keywords: "PDF-Datei entsperren, wie man eine PDF-Datei entsperrt, PDF entsperren, PDF-Dateien entsperren, zu PDF entsperren, PDF-Dateien entsperren, ungeschützte PDF-Datei, PDF-Entsperrer, entsperrte Datei, PDF-Dokument entsperren, SmallPDF entsperren, PDFs entsperren, PDF-Schutztool, Berechtigungskennwort, Herunterladen Ihrer Datei, Passwort von PDF, Online-PDF, PDF-Passwörter entfernen, SmallPDF PDF entsperren, PDF entfernen, Speichern klicken, Passwort klicken, PDF-Entsperrungstool",

    // Benefits Section
    benefits: {
      title: "Warum unser PDF-Entsperrungstool zum Entsperren von PDF-Dateien verwenden",
      list: [
        {
          title: "Schneller PDF-Entsperrer",
          description: "Verwenden Sie unser PDF-Entsperrungstool, um schnell das PDF-Passwort zu entfernen und eine ungeschützte PDF-Datei zu erstellen, die sofort zum Herunterladen bereit ist."
        },
        {
          title: "Einfaches Entsperren von PDF-Dateien",
          description: "Mit einem einfachen Passworteingabefeld können Sie PDF-Dateien online entsperren, indem Sie das Berechtigungskennwort oder das Dokumentöffnungskennwort eingeben – klicken Sie auf Speichern und Sie sind fertig."
        },
        {
          title: "PDFs auf jeder Plattform entsperren",
          description: "Unser Online-PDF-Entsperrer funktioniert auf jedem Betriebssystem, sodass das Entsperren von PDF-Dateien nahtlos funktioniert, egal ob Sie SmallPDF entsperren oder unser PDF-Entsperrungstool verwenden."
        },
        {
          title: "Sicheres Entsperren von PDF-Dokumenten",
          description: "Entfernen Sie sicher Passwörter aus PDF-Dateien mit unserem Tool und stellen Sie sicher, dass Ihre entsperrte Datei nach dem Entsperren privat bleibt."
        }
      ]
    },

    // Use Cases Section
    useCases: {
      title: "Wie man eine PDF-Datei entsperrt: Top-Anwendungsfälle",
      list: [
        {
          title: "PDF-Datei mit Berechtigungskennwort entsperren",
          description: "Verwenden Sie unseren PDF-Entsperrer, um das Berechtigungskennwort zu entfernen und PDF für vollen Zugriff zu entsperren, wenn Sie das Passwort kennen."
        },
        {
          title: "Online-PDF für Unternehmen",
          description: "Entsperren Sie PDF-Dateien online, um PDF-Passwörter aus Geschäftsdokumenten zu entfernen und so das Teilen und Bearbeiten mit einem schnellen Klick zu vereinfachen."
        },
        {
          title: "Studienmaterial in PDF entsperren",
          description: "Schützen Sie Online-PDF-Studienressourcen mit unserem PDF-Entsperrungstool, um eine ungeschützte PDF-Datei für nahtloses Lernen zu erstellen."
        },
        {
          title: "Persönliches PDF-Dokument entsperren",
          description: "Erfahren Sie, wie Sie eine PDF-Datei aus Ihrer persönlichen Sammlung entsperren, indem Sie Ihre Datei nach der Verwendung unserer SmallPDF-Entsperrungsalternative herunterladen."
        }
      ]
    },

    // How-To Section
    howTo: {
      title: "Wie man eine PDF-Datei in 3 Schritten entsperrt",
      upload: {
        title: "Schritt 1: Laden Sie Ihr Online-PDF hoch",
        description: "Beginnen Sie mit dem Entsperren von PDF, indem Sie die PDF-Datei hochladen, die Sie mit unserem PDF-Entsperrungstool entsperren möchten."
      },
      enterPassword: {
        title: "Schritt 2: Berechtigungskennwort eingeben",
        description: "Verwenden Sie das Passworteingabefeld, um das Passwort aus der PDF einzugeben, z. B. das Dokumentöffnungskennwort oder das Berechtigungskennwort."
      },
      download: {
        title: "Schritt 3: Entsperrte Datei herunterladen",
        description: "Schließen Sie das Entsperren von PDF-Dateien ab, indem Sie Ihre Datei als ungeschützte PDF-Datei herunterladen, nachdem wir das PDF-Passwort entfernt haben."
      }
    },

    // Features Section
    features: {
      title: "Hauptmerkmale unseres PDF-Entsperrers",
      list: [
        {
          title: "Unterstützt alle Online-PDFs",
          description: "Entsperren Sie PDF-Dateien mit Berechtigungskennwörtern oder Dokumentöffnungskennwörtern mühelos."
        },
        {
          title: "Schneller PDF-Entsperrungsprozess",
          description: "Entfernen Sie PDF-Passwörter in Sekundenschnelle mit unserem schnellen PDF-Entsperrungstool, ideal zum Herunterladen Ihrer Datei."
        },
        {
          title: "Plattformübergreifendes Entsperren von PDF-Dokumenten",
          description: "Verwenden Sie unseren PDF-Entsperrer auf jedem Betriebssystem für nahtloses Entsperren von PDF-Dateien."
        },
        {
          title: "Sichere Alternative zu SmallPDF-Entsperrung",
          description: "Schützen Sie PDF-Dateien mit verschlüsselter Verarbeitung und bieten Sie eine sichere Alternative zur SmallPDF-PDF-Entsperrung."
        }
      ]
    },

    // FAQ Section
    faq: {
      passwordRequired: {
        question: "Benötige ich einen Passwortklick, um PDF-Dateien zu entsperren?",
        answer: "Ja, Sie müssen das Passwort aus der PDF – wie das Dokumentöffnungskennwort oder das Berechtigungskennwort – im Passworteingabefeld eingeben, um PDFs zu entsperren. Unser Tool umgeht keine Passwörter."
      },
      security: {
        question: "Ist das Entsperren von PDF-Dateien mit diesem Tool sicher?",
        answer: "Ja, unser PDF-Entsperrungstool verarbeitet Online-PDFs auf verschlüsselten Servern. Wir speichern Ihre Dateien oder Passwörter nach dem Herunterladen Ihrer Datei nicht."
      },
      restrictions: {
        question: "Kann ich PDF ohne Passwortklick entsperren?",
        answer: "Ja, wenn es kein Dokumentöffnungskennwort gibt, aber ein Berechtigungskennwort vorhanden ist, laden Sie es hoch, um die PDF-Einschränkungen zu entfernen."
      },
      quality: {
        question: "Beeinträchtigt das Entsperren von PDF die Qualität?",
        answer: "Nein, unser PDF-Entsperrer entfernt nur das Passwort aus den PDF-Einstellungen – Ihre entsperrte Datei behält ihre ursprüngliche Qualität."
      },
      compatibility: {
        question: "Funktioniert dies für SmallPDF-PDF-Entsperrungsbenutzer?",
        answer: "Ja, unser PDF-Entsperrungstool funktioniert auf jedem Betriebssystem und dient als großartige Alternative zur SmallPDF-Entsperrung, um PDF-Dateien online zu entsperren."
      }
    },

    // Status Messages
    passwordProtected: "Passwortgeschützt",
    notPasswordProtected: "Nicht passwortgeschützt",
    unlocking: "PDF wird entsperrt...",
    unlockSuccess: "PDF erfolgreich entsperrt!",
    unlockSuccessDesc: "Ihr PDF-Dokument wurde erfolgreich entsperrt! Laden Sie Ihre entsperrte Datei jetzt herunter."
  },

  // Datei-Uploader
  fileUploader: {
    dropHere: "Datei hier ablegen",
    dropHereaDesc: "Legen Sie Ihre PDF-Datei hier ab oder klicken Sie, um zu durchsuchen",
    dragAndDrop: "Ziehen Sie Ihre Datei per Drag & Drop",
    browse: "Dateien durchsuchen",
    dropHereDesc: "Legen Sie Ihre Datei hier ab oder klicken Sie, um zu durchsuchen.",
    maxSize: "Die maximale Größe beträgt 100 MB.",
    remove: "Entfernen",
    inputFormat: "Eingabeformat",
    outputFormat: "Ausgabeformat",
    ocr: "OCR aktivieren",
    ocrDesc: "Extrahieren Sie Text aus gescannten Dokumenten mit Optical Character Recognition",
    quality: "Qualität",
    low: "Niedrig",
    high: "Hoch",
    password: "Passwort",
    categories: {
      documents: "Dokumente",
      spreadsheets: "Tabellen",
      presentations: "Präsentationen",
      images: "Bilder"
    },
    converting: "Konvertieren",
    successful: "Konvertierung erfolgreich",
    successDesc: "Ihre Datei wurde erfolgreich konvertiert und ist jetzt zum Download bereit.",
    download: "Konvertierte Datei herunterladen",
    filesSecurity: "Dateien werden automatisch nach 1 Stunden für Datenschutz und Sicherheit gelöscht."
  },

  // Allgemeine UI-Elemente
  ui: {
    upload: "Hochladen",
    download: "Herunterladen",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    save: "Speichern",
    next: "Weiter",
    previous: "Zurück",
    finish: "Fertigstellen",
    processing: "Wird verarbeitet...",
    success: "Erfolg!",
    error: "Fehler",
    copy: "Kopieren",
    remove: "Entfernen",
    browse: "Durchsuchen",
    dragDrop: "Drag & Drop",
    or: "oder",
    close: "Schließen",
    apply: "Anwenden",
    loading: "Wird geladen...",
    preview: "Vorschau",
    reupload: "Neue Datei hochladen",
    continue: "Weiter",
    skip: "Überspringen",
    retry: "Erneut versuchen",
    addMore: "Mehr hinzufügen",
    clear: "Leeren",
    clearAll: "Alles leeren",
    done: "Fertig",
    extract: "extrahieren",
    new: "Neu!",
    phone: "Telefon",
    address: "Adresse",
    filesSecurity: "Dateien werden automatisch nach 1 Stunden für Datenschutz und Sicherheit gelöscht."
  },

  contact: {
    title: "Kontaktieren Sie uns",
    description: "Haben Sie Fragen oder Feedback? Wir freuen uns, von Ihnen zu hören.",
    form: {
      title: "Senden Sie uns eine Nachricht",
      description: "Füllen Sie das untenstehende Formular aus, und wir werden uns so schnell wie möglich bei Ihnen melden.",
      name: "Ihr Name",
      email: "E-Mail-Adresse",
      subject: "Betreff",
      message: "Nachricht",
      submit: "Nachricht senden"
    },
    success: "Nachricht erfolgreich gesendet",
    successDesc: "Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei Ihnen melden.",
    error: "Fehler beim Senden der Nachricht",
    errorDesc: "Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
    validation: {
      name: "Name ist erforderlich",
      email: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      subject: "Betreff ist erforderlich",
      message: "Nachricht ist erforderlich"
    },
    supportHours: {
      title: "Supportzeiten",
      description: "Wann wir verfügbar sind, um zu helfen",
      weekdays: "Montag - Freitag",
      weekdayHours: "9:00 - 18:00 Uhr MEZ",
      saturday: "Samstag",
      saturdayHours: "10:00 - 16:00 Uhr MEZ",
      sunday: "Sonntag",
      closed: "Geschlossen"
    },
    faq: {
      title: "Häufig gestellte Fragen",
      responseTime: {
        question: "Wie lange dauert es, bis ich eine Antwort erhalte?",
        answer: "Wir bemühen uns, alle Anfragen innerhalb von 1-48 Geschäftsstunden zu beantworten. In Stoßzeiten kann es bis zu 72 Stunden dauern."
      },
      technicalSupport: {
        question: "Kann ich Support für ein technisches Problem erhalten?",
        answer: "Ja, unser technisches Support-Team steht Ihnen zur Verfügung, um Ihnen bei Problemen mit unseren PDF-Tools zu helfen."
      },
      phoneSupport: {
        question: "Bieten Sie Telefonsupport an?",
        answer: "Wir bieten Telefonsupport während unserer angegebenen Supportzeiten an. Für schnelle Hilfe ist E-Mail oft der schnellste Weg."
      },
      security: {
        question: "Sind meine persönlichen Daten sicher?",
        answer: "Wir nehmen Ihre Privatsphäre ernst. Alle Kommunikationen sind verschlüsselt, und wir geben Ihre persönlichen Daten niemals an Dritte weiter."
      }
    }
  },
  // Über uns-Seite
  about: {
    hero: {
      title: "Stärkung des digitalen Dokumentenmanagements",
      description: "MegaPDF wurde aus einer einfachen Idee geboren: Dokumentenmanagement nahtlos, effizient und für jeden zugänglich zu machen. Wir glauben daran, wie Menschen mit digitalen Dokumenten interagieren, zu transformieren."
    },
    story: {
      title: "Unsere Geschichte",
      paragraph1: "Gegründet im Jahr 2022, entstand MegaPDF aus der Frustration über den Umgang mit komplexen und unintuitiven PDF-Tools. Unsere Gründer, Technikbegeisterte und Experten für Dokumentenmanagement, sahen die Möglichkeit, eine Lösung zu schaffen, die sowohl leistungsstark als auch benutzerfreundlich ist.",
      paragraph2: "Was als kleines Projekt begann, wuchs schnell zu einer umfassenden Plattform heran, die Tausende von Nutzern weltweit bedient, von Studenten und Fachleuten bis hin zu großen Unternehmen."
    },
    missionValues: {
      title: "Unsere Mission und Werte",
      mission: {
        title: "Mission",
        description: "Digitales Dokumentenmanagement vereinfachen, indem wir intuitive, leistungsstarke und zugängliche PDF-Tools bereitstellen, die Produktivität und Kreativität steigern."
      },
      customerFirst: {
        title: "Kunde zuerst",
        description: "Wir legen Wert auf Benutzererfahrung und verbessern unsere Tools kontinuierlich basierend auf echtem Nutzerfeedback. Ihre Bedürfnisse treiben unsere Innovation an."
      },
      privacy: {
        title: "Datenschutz & Sicherheit",
        description: "Wir verpflichten uns, Ihre Daten mit modernsten Sicherheitsmaßnahmen und absolutem Respekt vor Ihrer Privatsphäre zu schützen."
      }
    },
    coreValues: {
      title: "Unsere Kernwerte",
      innovation: {
        title: "Innovation",
        description: "Wir verschieben kontinuierlich die Grenzen dessen, was im Dokumentenmanagement möglich ist."
      },
      collaboration: {
        title: "Zusammenarbeit",
        description: "Wir glauben an die Kraft der Teamarbeit, sowohl innerhalb unseres Unternehmens als auch mit unseren Nutzern."
      },
      accessibility: {
        title: "Zugänglichkeit",
        description: "Unsere Tools sind so gestaltet, dass sie einfach, intuitiv und für jeden verfügbar sind."
      }
    },
    team: {
      title: "Treffen Sie unser Team",
      description: "MegaPDF wird von einem kleinen, engagierten Team angetrieben, das sich darauf konzentriert, die bestmöglichen PDF-Tools für unsere Nutzer zu entwickeln.",
      member1: {
        name: "Cakra",
        role: "Leiter der App-Entwicklung",
        bio: "Überwacht die Entwicklung unserer Anwendungen, implementiert robuste Backend-Lösungen und stellt sicher, dass unsere Tools reibungslos und effizient funktionieren."
      },
      member2: {
        name: "Abdi",
        role: "Frontend-Webentwickler",
        bio: "Erstellt die Benutzeroberflächen, die unsere Tools intuitiv und zugänglich machen, mit Fokus auf außergewöhnliche Benutzererfahrungen auf all unseren Webplattformen."
      },
      member3: {
        name: "Anggi",
        role: "Marketing-Spezialistin",
        bio: "Leitet unsere Marketing-Bemühungen, um unsere Tools mit den Menschen zu verbinden, die sie brauchen, und fördert Bekanntheit und Wachstum unserer Plattform."
      }
    }
  },

  legal: {
    termsTitle: "Nutzungsbedingungen",
    privacyTitle: "Datenschutzrichtlinie",
    lastUpdated: "Zuletzt aktualisiert",
    introduction: {
      title: "Einführung",
      description: "Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie unseren Service nutzen."
    },
    dataUse: {
      title: "Wie wir Ihre Daten verwenden",
      description: "Wir verarbeiten Ihre Dateien nur, um den von Ihnen angeforderten Service bereitzustellen. Alle Dateien werden automatisch nach 1 Stunden gelöscht."
    },
    cookies: {
      title: "Cookies und Tracking",
      description: "Wir verwenden Cookies, um Ihr Erlebnis zu verbessern und den Website-Verkehr zu analysieren."
    },
    rights: {
      title: "Ihre Rechte",
      description: "Sie haben das Recht, auf Ihre persönlichen Daten zuzugreifen, sie zu korrigieren oder zu löschen."
    }
  },

  // Fehlerseiten
  error: {
    notFound: "Seite nicht gefunden",
    notFoundDesc: "Entschuldigung, wir konnten die von Ihnen gesuchte Seite nicht finden.",
    serverError: "Serverfehler",
    serverErrorDesc: "Entschuldigung, auf unserem Server ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
    goHome: "Zur Startseite",
    tryAgain: "Erneut versuchen"
  },
  universalCompressor: {
    title: "Universeller Dateikompressor",
    description: "PDFs, Bilder und Office-Dokumente komprimieren, ohne Qualität zu verlieren",
    dropHereDesc: "Dateien hierher ziehen und ablegen (PDF, JPG, PNG, DOCX, PPTX, XLSX)",
    filesToCompress: "Zu komprimierende Dateien",
    compressAll: "Alle Dateien komprimieren",
    results: {
      title: "Komprimierungsergebnisse",
      downloadAll: "Alle komprimierten Dateien herunterladen"
    },
    fileTypes: {
      pdf: "PDF-Dokument",
      image: "Bild",
      office: "Office-Dokument",
      unknown: "Unbekannte Datei"
    },
    howTo: {
      title: "Wie man Dateien komprimiert",
      step1: {
        title: "Dateien hochladen",
        description: "Laden Sie die Dateien hoch, die Sie komprimieren möchten"
      },
      step2: {
        title: "Qualität wählen",
        description: "Wählen Sie Ihr bevorzugtes Komprimierungslevel"
      },
      step3: {
        title: "Herunterladen",
        description: "Klicken Sie auf Komprimieren und laden Sie Ihre komprimierten Dateien herunter"
      }
    },
    faq: {
      compressionRate: {
        question: "Wie stark können Dateien komprimiert werden?",
        answer: "Die Komprimierungsraten variieren je nach Dateityp und Inhalt. PDFs werden typischerweise um 20-70 %, Bilder um 30-80 % und Office-Dokumente um 10-50 % komprimiert."
      },
      quality: {
        question: "Beeinflusst die Komprimierung die Qualität meiner Dateien?",
        answer: "Unsere Komprimierungsalgorithmen balancieren Größenreduktion mit Qualitätserhalt. Die Einstellung 'Hohe Qualität' erhält nahezu identische visuelle Qualität."
      },
      sizeLimit: {
        question: "Gibt es eine Dateigrößenbeschränkung?",
        answer: "Ja, Sie können Dateien bis zu 100 MB pro Datei komprimieren."
      }
    }
  },
  repairPdf: {
    title: "PDF-Dateien reparieren",
    description: "Beschädigte PDF-Dateien reparieren, Inhalte wiederherstellen und Dokumentstruktur optimieren",
    howTo: {
      title: "Wie Sie Ihre PDF reparieren",
      step1: {
        title: "Ihre PDF hochladen",
        description: "Wählen Sie die PDF-Datei aus, die Sie von Ihrem Gerät reparieren möchten"
      },
      step2: {
        title: "Reparaturmodus wählen",
        description: "Wählen Sie die passende Reparaturmethode basierend auf den Problemen Ihrer Datei"
      },
      step3: {
        title: "Reparierte PDF herunterladen",
        description: "Laden Sie Ihre reparierte PDF-Datei mit korrigierter Struktur und Inhalt herunter"
      }
    },
    why: {
      title: "Warum PDFs reparieren",
      corruptedFiles: {
        title: "Beschädigte Dateien reparieren",
        description: "Inhalte und Struktur von beschädigten PDF-Dateien wiederherstellen, die nicht richtig geöffnet werden können"
      },
      missingContent: {
        title: "Fehlenden Inhalt wiederherstellen",
        description: "Fehlende Bilder, Texte oder Seiten aus teilweise beschädigten Dokumenten wiederherstellen"
      },
      documentStructure: {
        title: "Dokumentstruktur reparieren",
        description: "Defekte interne Struktur, Seitenreferenzen und Links reparieren"
      },
      fileSize: {
        title: "Dateigröße optimieren",
        description: "Unnötige Daten bereinigen und Dateigröße ohne Qualitätsverlust optimieren"
      }
    },
    modes: {
      title: "Verfügbare Reparaturmodi",
      standard: {
        title: "Standardreparatur",
        description: "Behebt häufige PDF-Probleme, einschließlich defekter Querverweise, fehlerhafter Objekte und Stream-Fehler. Optimal für leicht beschädigte PDFs, die noch geöffnet werden können, aber Fehler anzeigen."
      },
      advanced: {
        title: "Erweiterte Wiederherstellung",
        description: "Tiefgehende Reparatur für stark beschädigte PDFs mit ernsthaften Strukturproblemen. Stellt so viel Inhalt wie möglich aus Dateien wieder her, die gar nicht geöffnet werden können."
      },
      optimization: {
        title: "Optimierung",
        description: "Restrukturiert und optimiert die PDF-Datei ohne Inhaltsverlust. Entfernt redundante Daten, behebt kleinere Probleme und verbessert die gesamte Dateistruktur."
      }
    },
    faq: {
      title: "Häufig gestellte Fragen",
      whatCanRepair: {
        question: "Welche Arten von PDF-Problemen können behoben werden?",
        answer: "Unser Reparaturwerkzeug kann eine Vielzahl von Problemen beheben, einschließlich beschädigter Dateistrukturen, defekter Seitenreferenzen, beschädigter Inhaltsströme, fehlender Querverweistabellen und ungültiger Objekte. Es kann oft Inhalte aus PDFs wiederherstellen, die nicht geöffnet werden oder in Standard-PDF-Viewern nicht korrekt angezeigt werden."
      },
      completelyDamaged: {
        question: "Können vollständig beschädigte PDFs repariert werden?",
        answer: "Während unser erweiterter Reparaturmodus Inhalte aus stark beschädigten PDFs wiederherstellen kann, ist eine 100%ige Wiederherstellung nicht immer möglich, wenn die Datei vollständig beschädigt ist. Selbst in extremen Fällen können wir jedoch oft Teile des Inhalts, insbesondere Texte und grundlegende Elemente, wiederherstellen."
      },
      contentQuality: {
        question: "Beeinflusst die Reparatur die Inhaltsqualität?",
        answer: "Nein, unser Reparaturprozess erhält die Qualität des wiederherstellbaren Inhalts. Im Gegensatz zu einigen Tools, die PDFs einfach extrahieren und neu erstellen (was Formatierungen verlieren kann), versuchen wir, die ursprüngliche Struktur zu bewahren und nur die beschädigten Teile zu reparieren."
      },
      passwordProtected: {
        question: "Können passwortgeschützte PDFs repariert werden?",
        answer: "Ja, Sie können passwortgeschützte PDFs reparieren, wenn Sie das Passwort haben. Sie müssen das Passwort während des Reparaturprozesses eingeben. Wir versuchen jedoch nicht, die Verschlüsselung geschützter Dokumente ohne entsprechende Berechtigung zu umgehen oder zu entfernen."
      },
      dataSecurity: {
        question: "Sind meine PDF-Daten während des Reparaturprozesses sicher?",
        answer: "Ja, wir nehmen Datensicherheit ernst. Ihre Dateien werden sicher auf unseren Servern verarbeitet, nicht mit Dritten geteilt und nach der Verarbeitung automatisch gelöscht. Wir verwenden Verschlüsselung für alle Dateiübertragungen, und der gesamte Reparaturprozess findet in einer sicheren Umgebung statt."
      }
    },
    bestPractices: {
      title: "Beste Praktiken für die PDF-Wiederherstellung",
      dos: "Tun Sie",
      donts: "Tun Sie nicht",
      dosList: [
        "Halten Sie Backups der Originaldateien vor Reparaturversuchen bereit",
        "Versuchen Sie zunächst den Standardreparaturmodus, bevor Sie die erweiterte Wiederherstellung nutzen",
        "Prüfen Sie die PDF mit mehreren Viewern, wenn möglich",
        "Notieren Sie sich, welche Seiten oder Elemente vor der Reparatur problematisch sind",
        "Verwenden Sie den Optimierungsmodus für große, aber funktionale PDFs"
      ],
      dontsList: [
        "Speichern Sie beschädigte PDFs nicht wiederholt, da dies den Schaden verschlimmern kann",
        "Nutzen Sie die Reparatur nicht als Ersatz für eine ordnungsgemäße PDF-Erstellung",
        "Erwarten Sie keine 100%ige Wiederherstellung bei stark beschädigten Dateien",
        "Öffnen Sie reparierte Dateien nicht in älteren PDF-Viewern, die sie erneut beschädigen könnten",
        "Überspringen Sie nicht die Überprüfung der reparierten Datei auf Inhaltsgenauigkeit"
      ]
    },
    relatedTools: {
      title: "Verwandte Tools",
      compress: "PDF komprimieren",
      unlock: "PDF entsperren",
      protect: "PDF schützen",
      edit: "PDF bearbeiten",
      viewAll: "Alle Tools anzeigen"
    },
    form: {
      title: "PDF-Reparatur-Tool",
      description: "Beschädigte PDFs reparieren, Inhalte wiederherstellen und Dokumentstruktur optimieren",
      upload: "PDF zum Reparieren hochladen",
      dragDrop: "Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Durchsuchen",
      selectFile: "PDF-Datei auswählen",
      maxFileSize: "Maximale Dateigröße: 100 MB",
      change: "Datei ändern",
      repairModes: "Reparaturmodus",
      standardRepair: "Standardreparatur",
      standardDesc: "Behebt häufige Probleme wie defekte Links und Strukturprobleme",
      advancedRecovery: "Erweiterte Wiederherstellung",
      advancedDesc: "Tiefgehende Wiederherstellung für stark beschädigte oder korrupte PDF-Dateien",
      optimization: "Optimierung",
      optimizationDesc: "Bereinigt und optimiert die PDF-Struktur ohne Inhaltsverlust",
      advancedOptions: "Erweiterte Optionen",
      showOptions: "Optionen anzeigen",
      hideOptions: "Optionen ausblenden",
      preserveFormFields: "Formularfelder erhalten",
      preserveFormFieldsDesc: "Interaktive Formularfelder wenn möglich beibehalten",
      preserveAnnotations: "Anmerkungen erhalten",
      preserveAnnotationsDesc: "Kommentare, Hervorhebungen und andere Anmerkungen beibehalten",
      preserveBookmarks: "Lesezeichen erhalten",
      preserveBookmarksDesc: "Dokumentgliederung und Lesezeichen beibehalten",
      optimizeImages: "Bilder optimieren",
      optimizeImagesDesc: "Bilder neu komprimieren, um die Dateigröße zu reduzieren",
      password: "PDF-Passwort",
      passwordDesc: "Diese PDF ist passwortgeschützt. Geben Sie das Passwort ein, um sie zu reparieren.",
      repair: "PDF reparieren",
      repairing: "PDF wird repariert...",
      security: "Ihre Dateien werden sicher verarbeitet. Alle Uploads werden nach der Verarbeitung automatisch gelöscht.",
      analyzing: "PDF-Struktur analysieren",
      rebuilding: "Dokumentstruktur neu aufbauen",
      recovering: "Inhalte wiederherstellen",
      fixing: "Querverweise reparieren",
      optimizing: "Datei optimieren",
      finishing: "Abschließen"
    },
    results: {
      success: "PDF erfolgreich repariert",
      successMessage: "Ihre PDF wurde repariert und ist bereit zum Herunterladen.",
      issues: "Reparaturprobleme erkannt",
      issuesMessage: "Wir sind bei der Reparatur Ihrer PDF auf Probleme gestoßen. Einige Inhalte sind möglicherweise nicht wiederherstellbar.",
      details: "Reparaturdetails",
      fixed: "Behobene Probleme",
      warnings: "Warnungen",
      fileSize: "Dateigröße",
      original: "Original",
      new: "Neu",
      reduction: "Reduktion",
      download: "Reparierte PDF herunterladen",
      repairAnother: "Eine weitere PDF reparieren"
    }
  },
  faq: {
    categories: {
      general: "Allgemein",
      conversion: "Konvertierung",
      security: "Sicherheit",
      account: "Konto",
      api: "API"
    },
    general: {
      question1: "Was ist MegaPDF?",
      answer1: "MegaPDF ist eine umfassende Online-Plattform für die Verwaltung und Konvertierung von PDFs. Unsere Tools helfen Ihnen, Ihre PDF-Dokumente zu konvertieren, zu bearbeiten, zusammenzuführen, zu teilen, zu komprimieren und zu sichern – über eine intuitive Weboberfläche oder API.",
      question2: "Muss ich ein Konto erstellen, um MegaPDF zu nutzen?",
      answer2: "Nein, Sie können unsere grundlegenden PDF-Tools ohne Registrierung nutzen. Ein kostenloses Konto bietet jedoch Vorteile wie gespeicherten Verlauf, höhere Dateigrößenlimits und Zugriff auf zusätzliche Funktionen.",
      question3: "Sind meine Daten auf MegaPDF sicher?",
      answer3: "Ja, alle Dateien werden auf unseren Servern mit Verschlüsselung sicher verarbeitet. Wir geben Ihre Dateien nicht an Dritte weiter, und sie werden nach der Verarbeitung automatisch von unseren Servern gelöscht (innerhalb von 1 Stunden). Weitere Details finden Sie in unserer Datenschutzrichtlinie.",
      question4: "Welche Geräte und Browser unterstützt MegaPDF?",
      answer4: "MegaPDF funktioniert auf allen modernen Browsern wie Chrome, Firefox, Safari und Edge. Unsere Plattform ist vollständig responsiv und läuft auf Desktops, Tablets und Mobilgeräten."
    },
    conversion: {
      question1: "Welche Dateitypen kann ich konvertieren?",
      answer1: "MegaPDF unterstützt die Konvertierung von PDFs in viele Formate, einschließlich Word (DOCX), Excel (XLSX), PowerPoint (PPTX), Bilder (JPG, PNG), HTML und reiner Text. Sie können diese Formate auch wieder in PDF umwandeln.",
      question2: "Wie genau sind Ihre PDF-Konvertierungen?",
      answer2: "Unser Konvertierungsmodul verwendet fortschrittliche Algorithmen, um die Formatierung inklusive Schriftarten, Bilder, Tabellen und Layout beizubehalten. Bei sehr komplexen Dokumenten können jedoch kleinere Formatierungsunterschiede auftreten. Für beste Ergebnisse empfehlen wir unsere Tools 'PDF zu Word' oder 'PDF zu Excel' für komplex formatierte Dokumente.",
      question3: "Gibt es eine Dateigrößenbeschränkung für Konvertierungen?",
      answer3: "Kostenlose Nutzer können Dateien bis 10 MB konvertieren. Basis-Abonnenten bis 50 MB, Pro-Abonnenten bis 100 MB und Enterprise-Nutzer bis 500 MB. Wenn Sie größere Dateien verarbeiten müssen, kontaktieren Sie uns für maßgeschneiderte Lösungen.",
      question4: "Warum ist meine PDF-Konvertierung fehlgeschlagen?",
      answer4: "Konvertierungen können fehlschlagen, wenn die Datei beschädigt, passwortgeschützt oder mit komplexen Elementen ausgestattet ist, die unser System nicht verarbeiten kann. Versuchen Sie zunächst unser 'PDF reparieren'-Tool und wiederholen Sie die Konvertierung. Bei anhaltenden Problemen nutzen Sie den 'Erweiterten' Konvertierungsmodus oder wenden sich an den Support."
    },
    security: {
      question1: "Wie schütze ich mein PDF mit einem Passwort?",
      answer1: "Nutzen Sie unser 'PDF schützen'-Tool. Laden Sie Ihr PDF hoch, legen Sie ein Passwort fest, wählen Sie Berechtigungsbeschränkungen (falls gewünscht) und klicken Sie auf 'PDF schützen'. Sie können steuern, ob Nutzer drucken, bearbeiten oder Inhalte kopieren dürfen.",
      question2: "Kann ich ein Passwort aus meinem PDF entfernen?",
      answer2: "Ja, verwenden Sie unser 'PDF entsperren'-Tool. Sie müssen das aktuelle Passwort angeben, um den Schutz zu entfernen. Beachten Sie, dass wir nur bei Dokumenten helfen, die Sie besitzen oder für die Sie eine Bearbeitungsgenehmigung haben.",
      question3: "Welche Verschlüsselungsstufe verwenden Sie für den PDF-Schutz?",
      answer3: "Wir verwenden die branchenübliche 256-Bit-AES-Verschlüsselung für den PDF-Schutz, die starke Sicherheit für Ihre Dokumente bietet. Wir unterstützen auch 128-Bit-Verschlüsselung für Kompatibilität mit älteren PDF-Readern."
    },
    account: {
      question1: "Wie kann ich mein Abonnement upgraden?",
      answer1: "Melden Sie sich bei Ihrem Konto an, gehen Sie zum Dashboard und wählen Sie den Reiter 'Abonnement'. Wählen Sie den Plan, der Ihren Bedürfnissen entspricht, und folgen Sie den Zahlungsanweisungen. Ihre neuen Funktionen werden sofort nach der Zahlung aktiviert.",
      question2: "Kann ich mein Abonnement kündigen?",
      answer2: "Ja, Sie können Ihr Abonnement jederzeit über das Dashboard unter dem Reiter 'Abonnement' kündigen. Sie haben bis zum Ende des aktuellen Abrechnungszeitraums weiterhin Zugriff auf Premium-Funktionen.",
      question3: "Wie setze ich mein Passwort zurück?",
      answer3: "Klicken Sie auf der Anmeldeseite auf 'Passwort vergessen?' und geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen des Passworts, der 1 Stunde gültig ist. Wenn Sie die E-Mail nicht erhalten, überprüfen Sie Ihren Spam-Ordner oder kontaktieren Sie den Support."
    },
    api: {
      question1: "Wie bekomme ich einen API-Schlüssel?",
      answer1: "Registrieren Sie sich für ein Konto und gehen Sie dann zu Dashboard > API-Schlüssel, um Ihren ersten API-Schlüssel zu erstellen. Kostenlose Konten erhalten 1 Schlüssel, Basis-Abonnenten 3, Pro-Abonnenten 10 und Enterprise-Nutzer 50+ Schlüssel.",
      question2: "Was sind die API-Ratenlimits?",
      answer2: "Die Ratenlimits hängen von Ihrem Abonnement ab: Kostenlos (10 Anfragen/Stunde), Basis (100 Anfragen/Stunde), Pro (1.000 Anfragen/Stunde), Enterprise (5.000+ Anfragen/Stunde). Monatliche Betriebslimits gelten ebenfalls für jedes Level.",
      question3: "Wie integriere ich die API in meine Anwendung?",
      answer3: "Unsere API verwendet standardmäßige REST-Endpunkte mit JSON-Antworten. Sie finden umfassende Dokumentation, Codebeispiele und SDKs in unserem Entwicklerbereich. Wir bieten Beispiele für verschiedene Programmiersprachen wie JavaScript, Python, PHP und Java."
    },
    title: "Häufig gestellte Fragen"
  },
  footer: {
    description: "Fortgeschrittene PDF-Tools für Profis. Konvertieren, bearbeiten, schützen und optimieren Sie Ihre Dokumente mit unserer leistungsstarken webbasierten Plattform und API.",
    contactUs: "Kontaktieren Sie uns",
    address: "123 Dokumentenstraße, PDF-Stadt, 94103, Vereinigte Staaten",
    subscribe: "Abonnieren Sie unseren Newsletter",
    subscribeText: "Erhalten Sie die neuesten Nachrichten, Updates und Tipps direkt in Ihren Posteingang.",
    emailPlaceholder: "Ihre E-Mail-Adresse",
    subscribeButton: "Abonnieren",
    pdfTools: "PDF-Tools",
    pdfManagement: "PDF-Verwaltung",
    company: "Unternehmen",
    support: "Support",
    aboutUs: "Über uns",
    careers: "Karriere",
    blog: "Blog",
    helpCenter: "Hilfezentrum",
    apiDocs: "API-Dokumentation",
    faqs: "FAQs",
    tutorials: "Tutorials",
    systemStatus: "Systemstatus",
    allRightsReserved: "Alle Rechte vorbehalten.",
    termsOfService: "Nutzungsbedingungen",
    privacyPolicy: "Datenschutzrichtlinie",
    cookiePolicy: "Cookie-Richtlinie",
    security: "Sicherheit",
    sitemap: "Sitemap",
    validEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    subscribeSuccess: "Vielen Dank für Ihr Abonnement unseres Newsletters!",
    viewAllTools: "Alle PDF-Tools anzeigen",
    repairPdf: "PDF reparieren",
    socialFacebook: "Facebook",
    socialTwitter: "Twitter",
    socialInstagram: "Instagram",
    socialLinkedin: "LinkedIn",
    socialGithub: "GitHub",
    socialYoutube: "YouTube"
  },
  security: {
    title: "Sicherheit und Datenschutz in MegaPDF",
    description: "Wir nehmen die Sicherheit und den Schutz Ihrer Dokumente ernst. Erfahren Sie, wie wir Ihre Daten schützen.",
    measures: {
      title: "Wie wir Ihre Daten schützen"
    },
    sections: {
      encryption: {
        title: "Ende-zu-Ende-Verschlüsselung",
        description: "Alle Dateien werden während der Übertragung mit TLS 1.3 und im Ruhezustand mit AES-256-Verschlüsselung geschützt. Ihre Dokumente werden niemals ungeschützt übertragen."
      },
      temporaryStorage: {
        title: "Temporäre Speicherung",
        description: "Dateien werden automatisch innerhalb von 1 Stunden nach der Verarbeitung gelöscht. Wir bewahren Ihre Dokumente nicht länger als nötig auf."
      },
      access: {
        title: "Zugriffskontrollen",
        description: "Robuste Authentifizierungs- und Autorisierungssysteme stellen sicher, dass nur Sie auf Ihre Dokumente und Kontoinformationen zugreifen können."
      },
      infrastructure: {
        title: "Sichere Infrastruktur",
        description: "Unsere Systeme laufen auf Enterprise-Cloud-Anbietern mit ISO 27001-Zertifizierung und regelmäßigen Sicherheitsüberprüfungen."
      },
      compliance: {
        title: "Compliance",
        description: "Unsere Prozesse entsprechen der GDPR, CCPA und anderen regionalen Datenschutzbestimmungen, um Ihre Datenrechte zu schützen."
      },
      monitoring: {
        title: "Kontinuierliche Überwachung",
        description: "Automatisierte und manuelle Sicherheitsüberprüfungen, Schwachstellenscans und Eindringlingserkennung schützen vor neuen Bedrohungen."
      }
    },
    tabs: {
      security: "Sicherheit",
      privacy: "Datenschutz",
      compliance: "Compliance"
    },
    tabContent: {
      security: {
        title: "Unser Sicherheitsansatz",
        description: "Umfassende Sicherheitsmaßnahmen zum Schutz Ihrer Dateien und Daten",
        encryption: {
          title: "Starke Verschlüsselung",
          description: "Wir verwenden TLS 1.3 für Daten in Transit und AES-256 für gespeicherte Daten. Alle Dateiübertragungen sind Ende-zu-Ende verschlüsselt."
        },
        auth: {
          title: "Sichere Authentifizierung",
          description: "Multi-Faktor-Authentifizierung, sichere Passwortspeicherung mit bcrypt und regelmäßige Überwachung der Konten auf verdächtige Aktivitäten."
        },
        hosting: {
          title: "Sichere Hosting-Umgebung",
          description: "Unsere Infrastruktur wird auf Enterprise-Cloud-Anbietern mit ISO 27001-Zertifizierung gehostet. Wir implementieren Netzwerksegmentierung, Firewalls und Intrusion-Detection-Systeme."
        },
        updates: {
          title: "Regelmäßige Updates",
          description: "Wir führen regelmäßige Sicherheitsupdates und Patches durch, Schwachstellenbewertungen und Penetrationstests, um potenzielle Probleme zu identifizieren und zu beheben."
        }
      },
      privacy: {
        title: "Datenschutzpraktiken",
        description: "Wie wir mit Ihren persönlichen Daten und Dokumenten umgehen",
        viewPolicy: "Vollständige Datenschutzrichtlinie anzeigen"
      },
      compliance: {
        title: "Compliance und Zertifizierungen",
        description: "Standards und Vorschriften, die wir einhalten",
        approach: {
          title: "Unser Compliance-Ansatz",
          description: "MegaPDF wurde mit Privacy-by-Design- und Security-by-Design-Prinzipien entwickelt. Wir überprüfen und aktualisieren unsere Praktiken regelmäßig, um den sich entwickelnden Vorschriften zu entsprechen."
        },
        gdpr: {
          title: "GDPR-Compliance"
        },
        hipaa: {
          title: "HIPAA-Überlegungen"
        }
      }
    },
    retention: {
      title: "Datenaufbewahrungsrichtlinie",
      description: "Wir befolgen strenge Data-Minimierung-Praktiken. Hier ist, wie lange wir verschiedene Datentypen aufbewahren:",
      documents: {
        title: "Hochgeladene Dokumente",
        description: "Dateien werden automatisch innerhalb von 1 Stunden nach der Verarbeitung von unseren Servern gelöscht. Wir bewahren keine Kopien Ihrer Dokumente auf, es sei denn, Sie wählen explizit Speicheroptionen, die für kostenpflichtige Pläne verfügbar sind."
      },
      account: {
        title: "Kontoinformationen",
        description: "Grundlegende Kontoinformationen werden so lange aufbewahrt, wie Sie ein aktives Konto haben. Sie können Ihr Konto jederzeit löschen, wodurch Ihre persönlichen Daten aus unseren Systemen entfernt werden."
      },
      usage: {
        title: "Nutzungsdaten",
        description: "Anonymisierte Nutzungsstatistiken werden bis zu 36 Monate aufbewahrt, um uns bei der Verbesserung unserer Dienste zu helfen. Diese Daten können nicht zur persönlichen Identifizierung verwendet werden."
      }
    },
    contact: {
      title: "Haben Sie Sicherheitsfragen?",
      description: "Unser Sicherheitsteam steht bereit, um Ihre Fragen zum Schutz Ihrer Daten und Privatsphäre zu beantworten.",
      button: "Kontaktieren Sie das Sicherheitsteam"
    },
    policy: {
      button: "Datenschutzrichtlinie"
    },
    faq: {
      dataCollection: {
        question: "Welche personenbezogenen Daten erfasst MegaPDF?",
        answer: "Wir erfassen nur die minimal notwendigen Informationen, um unsere Dienste bereitzustellen. Für registrierte Benutzer umfasst dies E-Mail, Name und Nutzungsstatistiken. Wir sammeln auch anonymisierte Nutzungsdaten zur Verbesserung unserer Dienste. Wir analysieren, untersuchen oder extrahieren nicht den Inhalt Ihrer Dokumente."
      },
      documentStorage: {
        question: "Wie lange bewahren Sie meine Dokumente auf?",
        answer: "Dokumente werden automatisch nach der Verarbeitung von unseren Servern gelöscht, in der Regel innerhalb von 1 Stunden. Für kostenpflichtige Abonnenten stehen Dokumentenspeicheroptionen zur Verfügung, dies sind jedoch nur optionale Funktionen."
      },
      thirdParty: {
        question: "Geben Sie meine Daten an Dritte weiter?",
        answer: "Wir verkaufen oder vermieten Ihre persönlichen Daten nicht. Wir teilen Daten nur mit Dritten, wenn dies für die Erbringung unserer Dienste notwendig ist (z.B. Zahlungsabwickler für Abonnements) oder wenn dies gesetzlich vorgeschrieben ist. Alle Drittanbieter werden sorgfältig geprüft und unterliegen Datenschutzvereinbarungen."
      },
      security: {
        question: "Wie schützen Sie meine Daten?",
        answer: "Wir verwenden branchenübliche Sicherheitsmaßnahmen, einschließlich TLS-Verschlüsselung für Daten in Transit, AES-256-Verschlüsselung für gespeicherte Daten, sichere Infrastrukturanbieter, Zugriffskontrollen und regelmäßige Sicherheitsüberprüfungen. Unsere Systeme sind mit Sicherheit als Priorität konzipiert."
      },
      rights: {
        question: "Welche Rechte habe ich in Bezug auf meine Daten?",
        answer: "Abhängig von Ihrer Region haben Sie möglicherweise folgende Rechte: Zugriff auf Ihre Daten, Berichtigung ungenauer Daten, Löschung Ihrer Daten, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung. Um diese Rechte auszuüben, wenden Sie sich an unser Support-Team."
      },
      breach: {
        question: "Was passiert bei einem Datenleck?",
        answer: "Wir haben Protokolle zur Erkennung, Reaktion und Benachrichtigung betroffener Nutzer gemäß geltenden Gesetzen im Falle eines Datenlecks. Wir führen regelmäßige Sicherheitsbewertungen durch, um das Risiko von Verstößen zu minimieren, und haben einen detaillierten Incident-Response-Plan."
      }
    }
  },
  developer: {
    title: "Entwickler-API-Dokumentation",
    description: "Integrieren Sie die leistungsstarken PDF-Tools von MegaPDF in Ihre Anwendungen mit unserer RESTful-API",
    tabs: {
      overview: "Übersicht",
      authentication: "Authentifizierung",
      endpoints: "Endpunkte",
      examples: "Beispiele",
      pricing: "Preise"
    },
    examples: {
      title: "Code-Beispiele",
      subtitle: "Lernen Sie, wie Sie unsere API mit diesen gebrauchsfertigen Beispielen integrieren können",
      pdfToWord: "PDF-zu-Word-Konvertierung",
      mergePdfs: "PDFs zusammenführen",
      protectPdf: "PDF schützen"
    },
    endpoints: {
      title: "API-Endpunkte",
      subtitle: "Vollständige Referenz für alle verfügbaren API-Endpunkte",
      categories: {
        all: "Alle",
        conversion: "Konvertierung",
        manipulation: "Manipulation",
        security: "Sicherheit",
        ocr: "OCR"
      },
      parameters: "Parameter",
      paramName: "Name",
      type: "Typ",
      required: "Erforderlich",
      description: "Beschreibung",
      responses: "Antworten"
    },
    pricing: {
      title: "API-Preise",
      subtitle: "Wählen Sie den richtigen Plan für Ihre API-Integrationsbedürfnisse",
      monthly: "Monatliche Abrechnung",
      yearly: "Jährliche Abrechnung",
      discount: "Sparen Sie 20%",
      forever: "für immer",
      includes: "Was enthalten ist:",
      getStarted: "Loslegen",
      subscribe: "Abonnieren",
      freePlan: {
        description: "Für gelegentliche Nutzung und Tests",
        feature1: "100 Operationen pro Monat",
        feature2: "10 Anfragen pro Stunde",
        feature3: "1 API-Schlüssel",
        feature4: "Grundlegende PDF-Operationen"
      },
      basicPlan: {
        description: "Für Startups und kleine Projekte",
        feature1: "1.000 Operationen pro Monat",
        feature2: "100 Anfragen pro Stunde",
        feature3: "3 API-Schlüssel",
        feature4: "Alle PDF-Operationen",
        feature5: "Grundlegende OCR"
      },
      proPlan: {
        description: "Für Unternehmen und Power-User",
        feature1: "10.000 Operationen pro Monat",
        feature2: "1.000 Anfragen pro Stunde",
        feature3: "10 API-Schlüssel",
        feature4: "Erweiterte OCR",
        feature5: "Priorisierter Support",
        feature6: "Benutzerdefinierte Wasserzeichen"
      },
      enterprisePlan: {
        description: "Für Integrationen mit hohem Volumen",
        feature1: "100.000+ Operationen pro Monat",
        feature2: "5.000+ Anfragen pro Stunde",
        feature3: "50+ API-Schlüssel",
        feature4: "Dedizierter Support",
        feature5: "Hilfe bei benutzerdefinierter Integration",
        feature6: "White-Label-Optionen"
      },
      customPricing: {
        title: "Brauchen Sie eine maßgeschneiderte Lösung?",
        description: "Für hohe API-Nutzung oder spezialisierte Integrationsanforderungen bieten wir maßgeschneiderte Preise mit dediziertem Support.",
        contactSales: "Vertrieb kontaktieren",
        enterprisePlus: "Enterprise+",
        dedicated: "Dedizierte Infrastruktur",
        sla: "Benutzerdefinierte SLAs",
        account: "Dedizierter Account-Manager",
        custom: "Maßgeschneiderte Preise"
      }
    },
    authentication: {
      loginRequired: "Anmeldung erforderlich",
      loginMessage: "Melden Sie sich bei Ihrem Konto an, um auf Ihre API-Schlüssel zuzugreifen.",
      signIn: "Anmelden",
      yourApiKey: "Ihr API-Schlüssel",
      noApiKeys: "Sie haben noch keine API-Schlüssel.",
      managementKeys: "API-Schlüssel verwalten",
      createApiKey: "API-Schlüssel erstellen",
      title: "API-Authentifizierung",
      subtitle: "Sichern Sie Ihre API-Anfragen mit API-Schlüsseln",
      apiKeys: {
        title: "API-Schlüssel",
        description: "Alle Anfragen an die MegaPDF-API erfordern eine Authentifizierung mit einem API-Schlüssel. Ihr API-Schlüssel hat viele Privilegien, also bewahren Sie ihn sicher auf!"
      },
      howTo: {
        title: "Wie man authentifiziert",
        description: "Sie können Ihre API-Anfragen auf eine von zwei Arten authentifizieren:"
      },
      header: {
        title: "1. Verwendung des HTTP-Headers (empfohlen)",
        description: "Fügen Sie Ihren API-Schlüssel in den x-api-key-Header Ihrer HTTP-Anfrage ein:"
      },
      query: {
        title: "2. Verwendung eines Abfrageparameters",
        description: "Alternativ können Sie Ihren API-Schlüssel als Abfrageparameter einfügen:"
      },
      security: {
        title: "Sicherheits-Best-Practices",
        item1: "Teilen Sie Ihren API-Schlüssel niemals öffentlich",
        item2: "Speichern Sie API-Schlüssel nicht im clientseitigen Code",
        item3: "Legen Sie geeignete Berechtigungen für Ihre API-Schlüssel fest",
        item4: "Rotieren Sie Ihre API-Schlüssel regelmäßig"
      },
      limits: {
        title: "Ratenbeschränkungen & Quoten",
        description: "API-Anfragen unterliegen Ratenbeschränkungen basierend auf Ihrem Abonnement-Tier:",
        plan: "Plan",
        operations: "Operationen",
        rate: "Ratenbeschränkung",
        keys: "API-Schlüssel"
      },
      errors: {
        title: "Fehler bei Ratenbeschränkungen",
        description: "Wenn Sie Ihre Ratenbeschränkung überschreiten, gibt die API eine 429 Too Many Requests-Antwort mit den folgenden Headern zurück:"
      }
    },
    api: {
      question1: "Wie bekomme ich einen API-Schlüssel?",
      answer1: "Registrieren Sie sich für ein Konto, gehen Sie dann zu Dashboard > API-Schlüssel, um Ihren ersten API-Schlüssel zu erstellen. Kostenlose Konten erhalten 1 API-Schlüssel, Basis-Abonnenten erhalten 3, Pro-Abonnenten erhalten 10 und Enterprise-Nutzer erhalten 50+ Schlüssel.",
      question2: "Was sind die API-Ratenbeschränkungen?",
      answer2: "Die Ratenbeschränkungen hängen von Ihrem Abonnement-Tier ab: Kostenlos (10 Anfragen/Stunde), Basis (100 Anfragen/Stunde), Pro (1.000 Anfragen/Stunde), Enterprise (5.000+ Anfragen/Stunde). Monatliche Operationslimits gelten ebenfalls für jedes Tier.",
      question3: "Wie integriere ich die API in meine Anwendung?",
      answer3: "Unsere API verwendet standardmäßige REST-Endpunkte mit JSON-Antworten. Sie finden umfassende Dokumentation, Codebeispiele und SDKs in unserem Entwicklerbereich. Wir bieten Beispiele für verschiedene Programmiersprachen wie JavaScript, Python, PHP und Java."
    },
    overview: {
      title: "API-Übersicht",
      subtitle: "Alles, was Sie über unsere API wissen müssen",
      intro: "Die MegaPDF-API ermöglicht es Ihnen, unsere PDF-Verarbeitungsfunktionen direkt in Ihre Anwendungen zu integrieren. Mit einer einfachen RESTful-Schnittstelle können Sie PDFs programmgesteuert konvertieren, komprimieren, zusammenführen, teilen und andere Operationen durchführen.",
      features: {
        title: "Hauptmerkmale",
        restful: "RESTful-API mit JSON-Antworten",
        authentication: "Einfache Authentifizierung mit API-Schlüsseln",
        operations: "Umfassende PDF-Operationen einschließlich Konvertierung, Komprimierung, Zusammenführung und mehr",
        scalable: "Skalierbare Preistiers, die Ihren Bedürfnissen entsprechen",
        secure: "Sichere Dateiverarbeitung mit verschlüsselten Übertragungen und automatischer Dateilöschung"
      },
      gettingStarted: "Erste Schritte",
      startSteps: "Um mit der MegaPDF-API zu beginnen:",
      step1: "Registrieren Sie sich für ein Konto",
      step2: "Generieren Sie einen API-Schlüssel aus Ihrem Dashboard",
      step3: "Stellen Sie Ihre erste API-Anfrage mit den bereitgestellten Beispielen",
      getStarted: "Loslegen"
    },
    tools: {
      conversion: {
        title: "PDF-Konvertierung",
        description: "Konvertieren Sie PDFs in verschiedene Formate (DOCX, XLSX, JPG) und umgekehrt."
      },
      manipulation: {
        title: "PDF-Manipulation",
        description: "Führen Sie mehrere PDFs zusammen, teilen Sie PDFs in separate Dateien oder komprimieren Sie PDFs, um die Dateigröße zu reduzieren."
      },
      security: {
        title: "PDF-Sicherheit",
        description: "Fügen Sie Passwortschutz hinzu, entsperren Sie geschützte PDFs und fügen Sie Wasserzeichen für Dokumentsicherheit hinzu."
      },
      viewEndpoints: "Endpunkte anzeigen"
    }
  },
  pricing: {
    description: "Wählen Sie den richtigen Plan für Ihre PDF-Bedürfnisse. MegaPDF bietet flexible Preisoptionen von kostenlos bis Unternehmen mit den Funktionen, die Sie benötigen.",

    // Page content
    title: "Einfache, transparente Preise",
    subtitle: "Wählen Sie den Plan, der zu Ihnen passt. Alle Pläne beinhalten unsere Kern-PDF-Tools.",
    monthly: "Monatlich",
    yearly: "Jährlich",
    saveUp: "Sparen Sie bis zu 20%",
    subscribe: "Abonnieren",
    feature: "Funktion",
    featureCompare: "Funktionsvergleich",

    // Features
    features: {
      operations: "Monatliche Operationen",
      amount: {
        free: "500 Operationen",
        basic: "5.000 Operationen",
        pro: "50.000 Operationen",
        enterprise: "500.000 Operationen"
      },
      apiAccess: "API-Zugang",
      apiKeys: {
        free: "1 API-Schlüssel",
        basic: "3 API-Schlüssel",
        pro: "10 API-Schlüssel",
        enterprise: "50 API-Schlüssel"
      },
      rateLimits: "Ratenbegrenzung",
      rateLimit: {
        free: "100 Anfragen/Stunde",
        basic: "1000 Anfragen/Stunde",
        pro: "2000 Anfragen/Stunde",
        enterprise: "5000 Anfragen/Stunde"
      },
      fileSizes: "Maximale Dateigröße",
      fileSize: {
        free: "25 MB",
        basic: "50 MB",
        pro: "100 MB",
        enterprise: "200 MB"
      },
      ocr: "OCR (Texterkennung)",
      watermarking: "Wasserzeichen",
      advancedProtection: "Erweiterter PDF-Schutz",
      bulkProcessing: "Massenverarbeitung",
      supports: "Support",
      support: {
        free: "E-Mail-Support",
        priority: "Priorisierter Support",
        dedicated: "Dedizierter Support"
      },
      whiteLabel: "White-Label-Optionen",
      serviceLevel: "Service-Level-Vereinbarung"
    },

    // Plan descriptions
    planDescriptions: {
      free: "Für gelegentliche PDF-Bedürfnisse",
      basic: "Für Einzelpersonen und kleine Teams",
      pro: "Für Profis und Unternehmen",
      enterprise: "Für große Organisationen"
    },

    // FAQ section
    faq: {
      title: "Häufig gestellte Fragen",
      q1: {
        title: "Was sind PDF-Operationen?",
        content: "PDF-Operationen umfassen das Konvertieren von PDFs in andere Formate (Word, Excel, etc.), das Komprimieren von PDFs, das Zusammenführen von PDFs, das Teilen von PDFs, das Hinzufügen von Wasserzeichen, das Extrahieren von Text und jede andere Aktion, die an einer PDF-Datei über unseren Dienst durchgeführt wird."
      },
      q2: {
        title: "Kann ich meinen Plan upgraden oder downgraden?",
        content: "Ja, Sie können Ihren Plan jederzeit upgraden oder downgraden. Beim Upgrade tritt der neue Plan sofort in Kraft. Beim Downgrade tritt der neue Plan am Ende Ihres aktuellen Abrechnungszyklus in Kraft."
      },
      q3: {
        title: "Bieten Sie Rückerstattungen an?",
        content: "Wir bieten eine 7-tägige Geld-zurück-Garantie auf alle kostenpflichtigen Pläne. Wenn Sie mit unserem Service nicht zufrieden sind, können Sie innerhalb von 7 Tagen nach Ihrem ersten Kauf eine Rückerstattung beantragen."
      },
      q4: {
        title: "Was passiert, wenn ich mein monatliches Operationslimit überschreite?",
        content: "Wenn Sie Ihr monatliches Operationslimit erreichen, können Sie keine zusätzlichen Operationen durchführen, bis Ihr Limit zu Beginn des nächsten Abrechnungszyklus zurückgesetzt wird. Sie können Ihren Plan jederzeit upgraden, um Ihr Limit zu erhöhen."
      },
      q5: {
        title: "Sind meine Daten sicher?",
        content: "Ja, wir nehmen Datensicherheit ernst. Alle Datei-Uploads und Verarbeitungen erfolgen über sichere HTTPS-Verbindungen. Wir speichern Ihre Dateien nicht länger als für die Verarbeitung notwendig, und alle Dateien werden nach Abschluss der Verarbeitung automatisch gelöscht."
      }
    },

    // CTA section
    cta: {
      title: "Bereit zum Starten?",
      subtitle: "Wählen Sie den Plan, der zu Ihnen passt, und beginnen Sie noch heute mit der Transformation Ihrer PDFs.",
      startBasic: "Mit Basic starten",
      explorePdfTools: "PDF-Tools erkunden"
    },

    // Login dialog
    loginRequired: "Anmeldung erforderlich",
    loginRequiredDesc: "Sie müssen sich in Ihr Konto einloggen, bevor Sie abonnieren können. Möchten Sie sich jetzt anmelden?",

    // Plan buttons
    getStarted: "Loslegen",
    currentPlan: "Aktueller Plan"
  },
  signPdf: {
    title: "PDF unterschreiben: Digitale Signaturen zu Dokumenten hinzufügen",
    description: "Fügen Sie Ihren PDF-Dokumenten einfach digitale Signaturen, Textanmerkungen, Stempel und Zeichnungen hinzu",
    howTo: {
      title: "Wie man PDF-Dokumente unterschreibt",
      step1: {
        title: "Ihr PDF hochladen",
        description: "Laden Sie das PDF-Dokument hoch, das Sie unterschreiben oder kommentieren möchten"
      },
      step2: {
        title: "Ihre Unterschrift hinzufügen",
        description: "Erstellen, hochladen oder zeichnen Sie Ihre Unterschrift und platzieren Sie sie auf dem Dokument"
      },
      step3: {
        title: "Speichern & Herunterladen",
        description: "Speichern Sie Ihre Änderungen und laden Sie das unterschriebene PDF-Dokument herunter"
      }
    },
    tools: {
      signature: "Unterschrift",
      text: "Text",
      stamp: "Stempel",
      draw: "Zeichnen",
      image: "Bild"
    },
    options: {
      draw: "Unterschrift zeichnen",
      upload: "Unterschrift hochladen",
      type: "Unterschrift tippen",
      clear: "Löschen",
      save: "Unterschrift speichern",
      color: "Farbe",
      fontSize: "Schriftgröße",
      cancel: "Abbrechen",
      apply: "Anwenden",
      position: "Position"
    },
    stamps: {
      approved: "Genehmigt",
      rejected: "Abgelehnt",
      draft: "Entwurf",
      final: "Endgültig",
      confidential: "Vertraulich"
    },
    messages: {
      noFile: "Keine Datei ausgewählt",
      uploadFirst: "Bitte laden Sie zuerst eine PDF-Datei zum Unterschreiben hoch",
      processing: "Ihr PDF wird verarbeitet...",
      signed: "PDF erfolgreich unterschrieben!",
      downloadReady: "Ihr unterschriebenes PDF ist zum Download bereit",
      error: "Fehler beim Unterschreiben des PDFs",
      errorDesc: "Es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut."
    },
    faq: {
      title: "Häufig gestellte Fragen",
      legality: {
        question: "Sind digitale Unterschriften rechtlich bindend?",
        answer: "Digitale Unterschriften, die mit unserem Tool erstellt werden, ähneln optisch handschriftlichen Unterschriften. Für rechtlich bindende elektronische Unterschriften, die Vorschriften wie eIDAS oder dem ESIGN Act entsprechen, benötigen Sie möglicherweise einen qualifizierten elektronischen Signaturdienst. Unser Tool eignet sich für interne Dokumente, Entwürfe oder wenn visuelle Unterschriften ausreichend sind."
      },
      security: {
        question: "Wie sicher sind die Unterschriften?",
        answer: "Unsere Unterschriften sind visuelle Überlagerungen auf dem PDF-Dokument. Sie bieten eine visuelle Darstellung der Zustimmung, enthalten jedoch keine kryptografischen Sicherheitsfunktionen, die in fortschrittlichen digitalen Signaturlösungen zu finden sind. Ihre Dokumente werden sicher verarbeitet, und wir speichern Ihre unterschriebenen PDFs nicht."
      },
      formats: {
        question: "Welche Unterschriftsformate werden unterstützt?",
        answer: "Sie können Unterschriften erstellen, indem Sie mit der Maus/dem Touchpad zeichnen, eine Bilddatei hochladen (PNG, JPG mit transparentem Hintergrund empfohlen) oder Ihren Namen in verschiedenen Schriftarten eingeben."
      },
      multipleSignatures: {
        question: "Kann ich mehrere Unterschriften zu einem Dokument hinzufügen?",
        answer: "Ja, Sie können mehrere Unterschriften, Textanmerkungen, Stempel und Zeichnungen zu Ihrem Dokument hinzufügen. Dies ist nützlich für Dokumente, die Unterschriften von mehreren Parteien erfordern oder Anmerkungen an verschiedenen Stellen benötigen."
      }
    },
    benefits: {
      title: "Vorteile digitaler Unterschriften",
      paperless: {
        title: "Papierlos arbeiten",
        description: "Vermeiden Sie das Drucken, Unterschreiben, Scannen und Versenden von Dokumenten per E-Mail"
      },
      time: {
        title: "Zeit sparen",
        description: "Unterschreiben Sie Dokumente sofort von überall aus ohne physische Handhabung"
      },
      professional: {
        title: "Professionelles Erscheinungsbild",
        description: "Erstellen Sie saubere, professionell aussehende unterschriebene Dokumente"
      },
      workflow: {
        title: "Optimierter Workflow",
        description: "Beschleunigen Sie Dokumentengenehmigungen und Geschäftsprozesse"
      }
    },
    useCases: {
      title: "Häufige Anwendungsfälle",
      contracts: {
        title: "Verträge & Vereinbarungen",
        description: "Fügen Sie Ihre Unterschrift zu Geschäftsverträgen und Vereinbarungen hinzu"
      },
      forms: {
        title: "Formulare & Anträge",
        description: "Füllen Sie Formulare aus und unterschreiben Sie sie ohne zu drucken"
      },
      approvals: {
        title: "Dokumentengenehmigungen",
        description: "Markieren Sie Dokumente als genehmigt mit offiziellen Stempeln und Unterschriften"
      },
      feedback: {
        title: "Feedback & Überarbeitungen",
        description: "Fügen Sie Kommentare und Anmerkungen zu Dokumenten während der Überprüfung hinzu"
      }
    },
    draw: "Zeichnen",
    addText: "Text hinzufügen",
    addImage: "Bild hinzufügen",
    download: "Unterschriebenes PDF herunterladen",
    processing: "Wird verarbeitet...",
    clearAll: "Alles löschen",
    uploadSignature: "Unterschrift hochladen",
    drawSignature: "Unterschrift zeichnen",
    signatureOptions: "Unterschriftsoptionen",
    annotationTools: "Anmerkungswerkzeuge",
    pages: "Seiten",
    uploadTitle: "PDF zum Unterschreiben hochladen",
    uploadDesc: "Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Durchsuchen"
  },
  ocrPdf: {
    title: 'OCR PDF',
    description: 'Konvertieren Sie nicht auswählbare PDF-Dateien in auswählbare und durchsuchbare PDFs mit hoher Genauigkeit mithilfe der OCR-Texttechnologie',
    step1Title: 'PDF hochladen',
    step1Description: 'Laden Sie das gescanntes PDF oder bildbasiertes Dokument hoch, das Sie mit OCR-Text durchsuchbar machen möchten',
    step2Title: 'OCR-Verarbeitung',
    step2Description: 'Unsere fortschrittliche OCR-Technologie erkennt und extrahiert gescannten Text aus Ihrem PDF',
    step3Title: 'Durchsuchbare PDF herunterladen',
    step3Description: 'Erhalten Sie Ihr verbessertes PDF mit auswählbaren, kopierbaren und durchsuchbaren Textdateien',
    howItWorksTitle: 'Wie OCR-Technologie funktioniert',
    howItWorksDescription: 'Optical Character Recognition (OCR) ist eine Technologie, die verschiedene Arten von Dokumenten, wie gescanntes PDF oder Bilder, in bearbeitbare und durchsuchbare Daten umwandelt. Wenden Sie OCR auf Ihr gescanntes PDF an, um es in Adobe Acrobat zu bearbeiten.',
    feature1Title: 'Gescannte Dokumente in Text umwandeln',
    feature1Description: 'OCR wandelt gescanntes Dokumente und Bilder in maschinenlesbaren Text um, sodass sie in Adobe Acrobat durchsuchbar und bearbeitbar sind.',
    feature2Title: 'Mehrsprachige Unterstützung',
    feature2Description: 'Unsere OCR-Engine erkennt Text in mehreren Sprachen mit hoher Genauigkeit, selbst in komplexen Dokumenten.',
    benefitsTitle: 'Warum OCR für Ihre PDFs verwenden?',
    benefit1Title: 'Durchsuchbarkeit',
    benefit1Description: 'Finden Sie Informationen schnell, indem Sie nach OCR-Text in Ihren Dokumenten suchen',
    benefit2Title: 'Kopieren & Einfügen',
    benefit2Description: 'Kopieren Sie Text direkt aus PDF-Dokumenten, anstatt Inhalte neu zu tippen',
    benefit3Title: 'Archivierung',
    benefit3Description: 'Erstellen Sie durchsuchbare Archive aus gescannten Dokumenten und älteren Textdateien',
    benefit4Title: 'Analysen',
    benefit4Description: 'Analysieren Sie den Dokumentinhalt mit Textextraktion und Datenverarbeitung',
    faqTitle: 'Häufig gestellte Fragen',
    faq1Question: 'Sind meine Daten während der OCR-Verarbeitung sicher?',
    faq1Answer: 'Ja, wir nehmen die Datensicherheit sehr ernst. Alle Datei-Uploads und die Verarbeitung erfolgen auf sicheren Servern. Ihre Dateien werden automatisch nach 1 Stunden gelöscht, und wir verwenden Ihre Dokumente für keinen anderen Zweck als die Bereitstellung des OCR-Dienstes.',
    relatedToolsTitle: 'Verwandte PDF-Tools',
    tool1Href: '/compress-pdf',
    tool1Title: 'PDF komprimieren',
    tool1IconColor: 'text-green-500',
    tool1BgColor: 'bg-green-100 dark:bg-green-900/30',
    tool2Href: '/pdf-to-word',
    tool2Title: 'PDF zu Word',
    tool2IconColor: 'text-blue-500',
    tool2BgColor: 'bg-blue-100 dark:bg-blue-900/30',
    tool3Href: '/merge-pdf',
    tool3Title: 'PDF zusammenführen',
    tool3IconColor: 'text-red-500',
    tool3BgColor: 'bg-red-100 dark:bg-red-900/30',
    tool4Href: '/pdf-tools',
    tool4Title: 'Alle PDF-Tools',
    tool4IconColor: 'text-purple-500',
    tool4BgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  rotatePdf: {
    title: "PDF-Seiten drehen",
    description: "Drehen Sie PDF-Seiten einfach im oder gegen den Uhrzeigersinn oder auf den Kopf mit unserem Online-Tool. Beheben Sie falsch gescanntes Dokumente mit präzisen PDF-Bearbeitungswerkzeugen und Schaltflächen zum Drehen ausgewählter Seiten oder eines Seitenbereichs.",
    howTo: {
      title: "So drehen Sie PDF-Seiten",
      step1: {
        title: "PDF hochladen",
        description: "Wählen Sie die PDF-Datei aus, indem Sie sie per Drag-and-Drop verschieben oder auf das Hochladen klicken, um die zu drehende Datei auszuwählen."
      },
      step2: {
        title: "Drehung auswählen",
        description: "Klicken Sie auf die Seitenminiaturen, um Seiten oder einen Seitenbereich auszuwählen, und verwenden Sie dann das Drehwerkzeug, um die Winkel (90°, 180° oder 270°) festzulegen."
      },
      step3: {
        title: "Herunterladen",
        description: "Verarbeiten und laden Sie Ihr gedrehtes PDF-Dokument mit allen korrekt ausgerichteten ausgewählten Seiten herunter."
      }
    },
    why: {
      title: "Warum PDF-Seiten drehen",
      fixScanned: {
        title: "Gescanntes Dokument beheben",
        description: "Korrigieren Sie die Ausrichtung falsch gescanntes Seiten, um sie lesbar zu machen, indem Sie Seitenminiaturen und das Drehwerkzeug verwenden."
      },
      presentation: {
        title: "Präsentationen verbessern",
        description: "Drehen Sie PDF-Seiten oder eine einzelne Seite, um die Ansicht auf Bildschirmen oder während Präsentationen zu optimieren."
      },
      mixedOrientation: {
        title: "Gemischte Ausrichtungen beheben",
        description: "Vereinheitlichen Sie Dokumente mit gemischten Hoch- und Querformatseiten, indem Sie ausgewählte Seiten oder einen Seitenbereich drehen."
      },
      printing: {
        title: "Für den Druck optimieren",
        description: "Stellen Sie sicher, dass alle Seiten vor dem Drucken korrekt ausgerichtet sind, indem Sie Schaltflächen zum Drehen eines Seitenbereichs verwenden, wodurch Papier gespart wird."
      }
    },
    features: {
      title: "Drehfunktionen",
      individual: {
        title: "Einzelne Seite drehen",
        description: "Klicken Sie auf die Seitenminiaturen, um eine einzelne Seite innerhalb Ihres Dokuments auszuwählen und zu drehen."
      },
      batch: {
        title: "Stapelweise Seitenauswahl",
        description: "Drehen Sie mehrere Seiten gleichzeitig, indem Sie einen Seitenbereich mit Optionen für ungerade, gerade oder alle Seiten auswählen."
      },
      preview: {
        title: "Live-Vorschau",
        description: "Sehen Sie, wie Ihre gedrehten Seiten vor der Verarbeitung mit Seitenminiaturen der ausgewählten Seiten aussehen werden."
      },
      precision: {
        title: "Präzise Steuerung",
        description: "Wählen Sie genaue Drehwinkel von 90°, 180° oder 270° für jede Seite mit dem Drehwerkzeug."
      }
    },
    form: {
      uploadTitle: "PDF zum Drehen hochladen",
      uploadDesc: "Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie auf die Schaltfläche, um die PDF auszuwählen und zum Bearbeiten zu öffnen.",
      rotateAll: "Alle Seiten drehen",
      rotateEven: "Gerade Seiten drehen",
      rotateOdd: "Ungerade Seiten drehen",
      rotateSelected: "Ausgewählte Seiten drehen",
      selectPages: "Seiten auswählen",
      rotateDirection: "Drehrichtung",
      clockwise90: "90° im Uhrzeigersinn",
      clockwise180: "180° (auf den Kopf gestellt)",
      counterClockwise90: "90° gegen den Uhrzeigersinn",
      apply: "Drehung anwenden",
      reset: "Alles zurücksetzen",
      processing: "PDF wird verarbeitet...",
      success: "PDF erfolgreich gedreht!",
      error: "Beim Drehen der PDF ist ein Fehler aufgetreten",
      showSelector: "Seiten auswählen",
      hideSelector: "Seitenauswahl ausblenden"
    },
    faq: {
      title: "Häufig gestellte Fragen",
      permanent: {
        question: "Ist die Drehung dauerhaft?",
        answer: "Ja, die Drehung wird dauerhaft auf die PDF angewendet. Sie können die PDF jedoch jederzeit erneut öffnen und die Schaltflächen verwenden, um sie bei Bedarf zurückzudrehen."
      },
      quality: {
        question: "Beeinflusst die Drehung die PDF-Qualität?",
        answer: "Nein, unser Online-Tool bewahrt die ursprüngliche Qualität Ihrer PDF. Da wir nur die Ausrichtung der ausgewählten Seiten ändern und den Inhalt nicht neu komprimieren, geht keine Bild- oder Textqualität verloren."
      },
      size: {
        question: "Ändert die Drehung meine Dateigröße?",
        answer: "Das Drehen von Seiten hat in der Regel nur geringen Einfluss auf die Dateigröße. Die Dateigröße kann sich aufgrund aktualisierter Metadaten geringfügig ändern, aber der Inhalt Ihres Seitenbereichs bleibt unverändert."
      },
      limitations: {
        question: "Gibt es Einschränkungen beim Drehen?",
        answer: "Sie können mit unserem kostenlosen Plan Dateien bis zu 100 MB drehen. Für größere Dateien sollten Sie unsere Premium-Pläne in Betracht ziehen. Darüber hinaus bietet das Drehwerkzeug Standardwinkel (90°, 180°, 270°) für ausgewählte Seiten anstelle von beliebigen Winkeln."
      },
      secured: {
        question: "Sind meine Dateien während der Drehung sicher?",
        answer: "Ja, alle Dateien werden sicher auf unseren Servern verarbeitet und nach der Verarbeitung automatisch gelöscht. Wir speichern oder teilen Ihre Dokumente nicht mit Dritten, wenn Sie die PDF zum Drehen auswählen."
      }
    },
    bestPractices: {
      title: "Beste Praktiken für die PDF-Drehung",
      dosList: [
        "Vorschau des Dokuments mit Seitenminiaturen vor dem Herunterladen der endgültigen Version",
        "Verwenden Sie die 180°-Drehung für auf dem Kopf stehende Seiten mit dem Drehwerkzeug",
        "Drehen Sie alle Seiten gleichzeitig, wenn das gesamte Dokument oder ein Seitenbereich dasselbe Ausrichtungsproblem hat",
        "Speichern Sie die Originaldatei vor der Drehung als Sicherung",
        "Überprüfen Sie alle ausgewählten Seiten nach der Drehung, um die korrekte Ausrichtung sicherzustellen"
      ],
      dontsList: [
        "Drehen Sie keine kennwortgeschützten PDFs, ohne sie zuerst zu entsperren",
        "Mischen Sie keine 90°- und 270°-Drehungen im selben Dokument, wenn Konsistenz wichtig ist",
        "Gehen Sie nicht davon aus, dass alle Seiten dieselbe Drehung benötigen – überprüfen Sie jede Seitenminiatur",
        "Drehen Sie keine Formularfelder, wenn Sie sie funktionsfähig halten möchten",
        "Drehen Sie nicht, wenn das PDF bereits korrekt ausgerichtet ist"
      ],
      dos: "Dos",
      donts: "Donts"
    },
    relatedTools: {
      title: "Verwandte Tools",
      compress: "PDF komprimieren",
      merge: "PDF zusammenführen",
      split: "PDF teilen",
      edit: "PDF bearbeiten",
      viewAll: "Alle Tools anzeigen"
    },
    messages: {
      selectAll: "Alle auswählen",
      downloading: "Download wird vorbereitet...",
      rotationApplied: "Drehung auf {count} Seiten angewendet",
      dragDrop: "Ziehen und Ablegen, um Seiten neu anzuordnen",
      pageOf: "Seite {current} von {total}",
      selectPageInfo: "Klicken Sie auf die Seitenminiaturen, um Seiten für die Drehung auszuwählen"
    }
  },
  pageNumber: {
    title: "Seitenzahlen zu einem PDF hinzufügen",
    shortDescription: "Fügen Sie anpassbare Seitenzahlen einfach zu Ihren PDF-Dokumenten hinzu",
    description: "Fügen Sie benutzerdefinierte Seitenzahlen zu einem PDF mit verschiedenen Zahlenformaten, Positionen und Stilen mit unserem Online-Tool hinzu",

    uploadTitle: "Laden Sie Ihr PDF hoch",
    uploadDesc: "Laden Sie eine PDF-Datei hoch, um Seitenzahlen oder Kopfzeilen hinzuzufügen. Ihre Datei wird sicher verarbeitet, kompatibel mit jedem Betriebssystem.",

    messages: {
      noFile: "Bitte laden Sie zuerst eine PDF-Datei hoch",
      success: "Seitenzahlen erfolgreich hinzugefügt!",
      error: "Fehler beim Hinzufügen der Seitenzahlen",
      processing: "Verarbeitung Ihres PDFs..."
    },
    ui: {
      browse: "Dateien durchsuchen",
      filesSecurity: "Ihre Dateien sind sicher und werden nie dauerhaft gespeichert",
      error: "Ungültiger Dateityp. Bitte laden Sie eine PDF hoch.",
      cancel: "Abbrechen",
      addPageNumbers: "Seitennummern hinzufügen",
      processingProgress: "Wird verarbeitet... ({progress}%)",
      successTitle: "Seitennummern erfolgreich hinzugefügt",
      successDesc: "Ihre PDF wurde verarbeitet und ist zum Download bereit",
      readyMessage: "Ihre PDF ist fertig!",
      readyDesc: "Ihre PDF-Datei wurde verarbeitet und Seitennummern wurden gemäß Ihren Einstellungen hinzugefügt.",
      download: "PDF herunterladen",
      processAnother: "Weitere PDF verarbeiten",
      settingsTitle: "Seitennummern-Einstellungen",
      numberFormat: "Zahlenformat",
      position: "Position",
      topLeft: "Oben links",
      topCenter: "Oben Mitte",
      topRight: "Oben rechts",
      bottomLeft: "Unten links",
      bottomCenter: "Unten Mitte",
      bottomRight: "Unten rechts",
      fontFamily: "Schriftart",
      fontSize: "Schriftgröße",
      color: "Farbe",
      startFrom: "Beginnen bei",
      prefix: "Präfix",
      suffix: "Suffix",
      horizontalMargin: "Horizontaler Rand (px)",
      pagesToNumber: "Seiten nummerieren",
      pagesHint: "Leer lassen für alle Seiten",
      pagesExample: "Verwenden Sie Kommas für einzelne Seiten und Bindestriche für Bereiche (z.B. 1,3,5-10)",
      skipFirstPage: "Erste Seite überspringen (z.B. für Deckblätter)",
      preview: "Vorschau:",
      pagePreview: "Seitenvorschau"
    },
    howTo: {
      title: "Wie man Seitenzahlen hinzufügt",
      step1: {
        title: "Laden Sie Ihr PDF hoch",
        description: "Wählen Sie die PDF-Datei aus, deren Seiten Sie nummerieren möchten"
      },
      step2: {
        title: "Seitenzahlen anpassen",
        description: "Wählen Sie Zahlenformate, Seitenbereich, Position, Schriftart und andere Einstellungen, um das PDF zu bearbeiten"
      },
      step3: {
        title: "Laden Sie Ihr PDF herunter",
        description: "Verarbeiten und laden Sie Ihr PDF mit hinzugefügten Seitenzahlen mit unserem Online-Tool herunter"
      }
    },

    benefits: {
      title: "Vorteile des Hinzufügens von Seitenzahlen",
      navigation: {
        title: "Verbesserte Navigation",
        description: "Erleichtern Sie die Navigation durch Ihre Dokumente mit klar sichtbaren Seitenzahlen über jeden Seitenbereich hinweg"
      },
      professional: {
        title: "Professionelle Dokumente",
        description: "Verleihen Sie Ihren rechtlichen oder geschäftlichen Dokumenten ein professionelles Aussehen mit korrekt formatierten Nummern"
      },
      organization: {
        title: "Bessere Organisation",
        description: "Behalten Sie den Überblick über Seiten in großen Dokumenten und verweisen Sie leicht auf bestimmte Seiten mit hinzugefügten Nummern"
      },
      customization: {
        title: "Vollständige Anpassung",
        description: "Passen Sie das Aussehen und die Position der Seitenzahlen an oder fügen Sie Kopfzeilen hinzu, die zum Stil Ihres Dokuments passen"
      }
    },

    useCases: {
      title: "Häufige Anwendungsfälle",
      books: {
        title: "Bücher und E-Books",
        description: "Fügen Sie einfach korrekte Seitennummerierung zu Ihren Büchern, E-Books oder Berichten hinzu, um Lesbarkeit und Referenzierung zu verbessern"
      },
      academic: {
        title: "Akademische Arbeiten",
        description: "Nummerieren Sie Seiten in Thesen, Dissertationen und Forschungspapieren gemäß akademischen Standards mit flexiblen Formatoptionen"
      },
      business: {
        title: "Geschäftsdokumente",
        description: "Fügen Sie professionelle Seitenzahlen zu Angeboten, Berichten und Geschäftsplänen hinzu, ohne Adobe Acrobat Pro zu benötigen"
      },
      legal: {
        title: "Rechtliche Dokumente",
        description: "Wenden Sie konsistente Seitennummerierung auf Verträge und rechtliche Dokumente an, um korrekte Referenzierung zu gewährleisten"
      }
    },

    faq: {
      title: "Häufig gestellte Fragen",
      formats: {
        question: "Welche Zahlenformate sind verfügbar?",
        answer: "Unser Online-Tool unterstützt mehrere Zahlenformate: numerisch (1, 2, 3), römische Zahlen (I, II, III) und alphabetisch (A, B, C). Wählen Sie das passende Format für Ihre Bedürfnisse."
      },
      customize: {
        question: "Kann ich das Aussehen der Seitenzahlen anpassen?",
        answer: "Ja, Sie können die Seitenzahlen vollständig anpassen, indem Sie Präfixe (wie 'Seite '), Suffixe (wie ' von 10'), Schriftarten, Größen, Farben hinzufügen und sie an beliebiger Stelle auf der Seite positionieren."
      },
      skipPages: {
        question: "Kann ich bestimmte Seiten beim Hinzufügen von Seitenzahlen überspringen?",
        answer: "Absolut! Sie können einen Seitenbereich angeben, um Seiten selektiv zu nummerieren, oder die erste Seite (z. B. ein Deckblatt) mit einem Klick überspringen."
      },
      startNumber: {
        question: "Kann ich die Seitennummerierung bei einer bestimmten Zahl beginnen lassen?",
        answer: "Ja, Sie können die Startnummer für Ihre Sequenz festlegen – ideal für Dokumente, die von anderen fortgesetzt werden oder spezielle Nummerierungsanforderungen haben."
      },
      security: {
        question: "Ist mein PDF sicher, wenn ich es hochlade?",
        answer: "Ja, alle Verarbeitungen sind sicher. Ihre Dateien werden während der Übertragung verschlüsselt, verarbeitet und anschließend automatisch gelöscht – keine dauerhafte Speicherung oder Zugriff außer zum Hinzufügen der Nummern."
      }
    },

    relatedTools: {
      title: "Verwandte Tools"
    }
  },
  pdfChat: {
    title: "Fragen Sie alles PDF-Chat",
    description: "Laden Sie ein PDF hoch und stellen Sie Fragen zu dessen Inhalt",
    seo: {
      title: "Fragen Sie alles PDF-Chat - Interaktive PDF-Dokumentenanalyse",
      description: "Laden Sie ein PDF-Dokument hoch und stellen Sie natürliche Sprachfragen, um schnell Antworten, Zusammenfassungen und Erkenntnisse aus jeder PDF-Datei zu erhalten.",
      keywords: "PDF-Chat, PDF-Fragen stellen, PDF-Analyse, Dokumenten-KI, PDF-Assistent, Dokumentenanalyse"
    },
    whatYouCanAsk: {
      title: "Was Sie fragen können",
      summary: {
        title: "Zusammenfassungen erhalten",
        description: "Fragen Sie nach Zusammenfassungen bestimmter Abschnitte oder des gesamten Dokuments."
      },
      find: {
        title: "Informationen finden",
        description: "Fragen Sie, wo bestimmte Informationen im Dokument erscheinen."
      },
      extract: {
        title: "Schlüsselpunkte extrahieren",
        description: "Fragen Sie nach Listen mit Schlüsselpunkten, Daten, Namen oder anderen wichtigen Informationen."
      },
      explain: {
        title: "Erklärungen erhalten",
        description: "Fragen Sie nach Erklärungen zu komplexen Konzepten, die im Dokument erwähnt werden."
      }
    },
    faq: {
      title: "Häufig gestellte Fragen",
      q1: {
        question: "Welche Arten von PDFs kann ich verwenden?",
        answer: "Sie können jede PDF-Datei verwenden, die Textinhalt enthält. Das System funktioniert am besten mit digitalen PDFs, kann aber auch gescannte Dokumente mit lesbarem Text verarbeiten."
      },
      q2: {
        question: "Sind meine PDF-Daten sicher?",
        answer: "Ja, Ihre PDF wird sicher verarbeitet. Wir speichern den Inhalt Ihrer Dokumente nicht dauerhaft und alle Verarbeitungen erfolgen in einer sicheren Umgebung."
      },
      q3: {
        question: "Gibt es Größenbeschränkungen?",
        answer: "Ja, derzeit beträgt die maximale Dateigröße 50 MB. Für sehr große Dokumente sollten Sie diese in kleinere Teile aufteilen, um eine bessere Verarbeitung zu ermöglichen."
      },
      q4: {
        question: "Versteht die KI Tabellen und Diagramme?",
        answer: "Die KI kann Text aus Tabellen extrahieren und interpretieren, aber das Verständnis komplexer Diagramme oder Grafiken kann eingeschränkt sein. Es funktioniert am besten mit Textinhalten."
      }
    },
    seoContent: {
      title: "Verbessern Sie Ihre Dokumentenanalyse",
      p1: "Unsere \"Fragen Sie alles\"-Funktion nutzt fortschrittliche KI, um Ihnen zu helfen, schnell Erkenntnisse aus PDF-Dokumenten zu extrahieren. Egal, ob Sie Forschungsarbeiten, juristische Verträge, technische Handbücher oder andere textlastige Dokumente analysieren, dieses Tool hilft Ihnen, die gewünschten Informationen zu finden, ohne stundenlang Seiten mit Inhalten durchlesen zu müssen.",
      p2: "Der KI-Assistent kann den Kontext Ihrer Fragen verstehen und relevante Informationen aus dem Dokument liefern. Er kann Schlüsselabschnitte identifizieren, Inhalte zusammenfassen, komplexe Begriffe erklären und sogar spezifische Details wie Daten, Beträge oder Klauseln finden, die tief im Text verborgen sein könnten.",
      p3: "Diese Funktion ist besonders nützlich für Fachleute, die schnell Dokumente analysieren müssen, Studenten, die akademische Arbeiten recherchieren, oder jeden, der Zeit sparen möchte, indem er direkt zu den wichtigen Informationen in seinen PDFs gelangt.",
      p4: "Probieren Sie es jetzt aus, indem Sie Ihr PDF hochladen und eine Frage stellen!"
    },
    uploading: "PDF wird hochgeladen...",
    processing: "PDF wird verarbeitet...",
    thinking: "Denken...",
    send: "Senden",
    uploadPrompt: "Laden Sie Ihr PDF-Dokument hoch",
    askPrompt: "Stellen Sie eine Frage zum Dokument...",
    newPdf: "Neues PDF",
    dropHereDesc: "Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Durchsuchen. Ich werde sie analysieren, damit Sie Fragen zum Inhalt stellen können.",
    securityNote: "Ihre Dateien werden sicher verarbeitet und nicht dauerhaft gespeichert.",
    poweredBy: "Unterstützt von OpenAI",
    howItWorks: {
      title: "So funktioniert es",
      step1: {
        title: "Laden Sie Ihr PDF hoch",
        description: "Ziehen Sie Ihre PDF-Datei einfach in den Upload-Bereich oder klicken Sie, um Ihre Dateien durchzusehen."
      },
      step2: {
        title: "KI verarbeitet den Inhalt",
        description: "Unsere KI analysiert schnell das gesamte Dokument, um dessen Inhalt und Struktur zu verstehen."
      },
      step3: {
        title: "Stellen Sie Fragen",
        description: "Fragen Sie alles über das Dokument und erhalten Sie genaue Antworten, die aus dem PDF-Inhalt gezogen werden."
      }
    },
  },
  removePdf: {
    title: "Seiten aus PDF entfernen",
    description: "Entfernen Sie unerwünschte Seiten aus Ihren PDF-Dokumenten mit visueller Vorschau und präziser Kontrolle.",
    uploadTitle: "PDF zum Entfernen von Seiten hochladen",
    uploadDesc: "Wählen Sie eine PDF-Datei aus, um bestimmte Seiten zu entfernen, während die Qualität der verbleibenden Seiten erhalten bleibt.",
    selectPages: "Seiten zum Entfernen auswählen",
    selectPagesDesc: "Klicken Sie auf die Seitenvorschauen, um sie anzusehen, oder aktivieren Sie das Kontrollkästchen, um sie zur Entfernung zu markieren",
    pagesSelected: "Seiten ausgewählt",
    pagesRemaining: "Seiten verbleiben",
    selectMax: "Maximal auswählen",
    clearSelection: "Auswahl löschen",
    saveDocument: "Dokument speichern",
    preview: "Ergebnisvorschau",
    previewDesc: "Seiten, die in Ihrem Dokument verbleiben: {remaining}",
    processing: "Seiten werden entfernt",
    page: "Seite",
    pagePreview: "Seitenvorschau -",
    removeFromDocument: "Entfernung abbrechen",
    markForRemoval: "Zur Entfernung markieren",
    messages: {
      processing: "Bitte warten Sie, während die ausgewählten Seiten aus Ihrem PDF entfernt werden...",
      success: "Seiten erfolgreich entfernt",
      error: "Seiten konnten nicht entfernt werden. Bitte versuchen Sie es erneut.",
      downloadReady: "Ihr PDF mit entfernten Seiten ist zum Download bereit.",
      invalidFile: "Bitte wählen Sie eine gültige PDF-Datei aus",
      cannotRemoveAll: "Sie können nicht alle Seiten entfernen. Mindestens eine Seite muss verbleiben."
    },
    howTo: {
      title: "Wie man Seiten aus einem PDF entfernt",
      step1: {
        title: "PDF hochladen",
        description: "Wählen Sie eine PDF-Datei aus oder ziehen Sie sie per Drag & Drop, aus der Sie Seiten entfernen möchten."
      },
      step2: {
        title: "Seiten zum Entfernen auswählen",
        description: "Klicken Sie auf die Vorschaubilder, um Seiten anzusehen. Aktivieren Sie das Kontrollkästchen, um Seiten zur Entfernung zu markieren."
      },
      step3: {
        title: "Speichern und herunterladen",
        description: "Klicken Sie auf Dokument speichern, um Ihre Änderungen zu verarbeiten, und laden Sie dann Ihr PDF herunter."
      }
    },
    benefits: {
      title: "Vorteile unseres PDF-Seitenentferners",
      accuracy: {
        title: "Präzise Seitenauswahl",
        description: "Vorschau der Seiten vor dem Entfernen, um Genauigkeit zu gewährleisten."
      },
      preview: {
        title: "Vollständige Seitenvorschau",
        description: "Klicken Sie auf die Seitenvorschau, um sie mit Zoomfunktionen im Detail anzusehen."
      },
      secure: {
        title: "Sichere Verarbeitung",
        description: "Ihre Dateien werden lokal verarbeitet und sofort nach der Verarbeitung gelöscht."
      },
      flexible: {
        title: "Flexible Auswahl",
        description: "Wählen Sie Seiten einfach aus oder ab, mit visueller Rückmeldung."
      }
    },
    useCases: {
      title: "Häufige Anwendungsfälle",
      confidential: {
        title: "Vertrauliche Inhalte entfernen",
        description: "Entfernen Sie einfach Seiten mit sensiblen Informationen vor dem Teilen."
      },
      reports: {
        title: "Berichte anpassen",
        description: "Entfernen Sie irrelevante Abschnitte, um fokussierte Dokumente zu erstellen."
      },
      presentations: {
        title: "Präsentationen anpassen",
        description: "Entfernen Sie bestimmte Folien, um sie für verschiedene Zielgruppen zu optimieren."
      },
      sharing: {
        title: "Vorbereitung zum Teilen",
        description: "Bereinigen Sie Dokumente, indem Sie unnötige Seiten entfernen."
      }
    },
    faq: {
      title: "Häufig gestellte Fragen",
      multiplePages: {
        question: "Kann ich mehrere Seiten gleichzeitig entfernen?",
        answer: "Ja, Sie können mehrere Seiten in einem Vorgang auswählen und entfernen."
      },
      pageLimit: {
        question: "Gibt es eine Grenze für die Anzahl der Seiten, die ich entfernen kann?",
        answer: "Sie können so viele Seiten entfernen, wie Sie möchten, aber mindestens eine Seite muss verbleiben."
      },
      quality: {
        question: "Beeinträchtigt das Entfernen von Seiten die Qualität der verbleibenden Seiten?",
        answer: "Nein, die Qualität der verbleibenden Seiten bleibt erhalten."
      },
      encrypted: {
        question: "Kann ich Seiten aus passwortgeschützten PDFs entfernen?",
        answer: "Sie müssen passwortgeschützte PDFs zunächst entsperren."
      }
    }
  },
  terms: {
    title: "Nutzungsbedingungen",
    meta: {
      title: "Nutzungsbedingungen | MegaPDF - PDF-Tools",
      description: "Nutzungsbedingungen für MegaPDF PDF-Tools. Lesen Sie unsere Bedingungen für die Nutzung unserer Dienste."
    },
    lastUpdated: "Zuletzt aktualisiert: 18. März 2025",
    welcome: "Willkommen bei MegaPDF. Bitte lesen Sie diese Nutzungsbedingungen sorgfältig durch, bevor Sie unsere Website, mobilen Anwendungen und Dienste (zusammen die Dienste) nutzen.",
    sections: {
      acceptance: {
        title: "1. Annahme der Bedingungen",
        content: "Durch den Zugriff auf oder die Nutzung unserer Dienste erklären Sie sich mit diesen Bedingungen einverstanden. Wenn Sie diesen Bedingungen nicht zustimmen, nutzen Sie unsere Dienste bitte nicht."
      },
      services: {
        title: "2. Beschreibung der Dienste",
        description: "MegaPDF bietet Tools für die Konvertierung, Bearbeitung und Optimierung von PDF-Dokumenten, einschließlich, aber nicht beschränkt auf:",
        features: {
          feature1: "Konvertierung von PDFs in verschiedene Formate (DOCX, XLSX, JPG usw.)",
          feature2: "Konvertierung von Dokumenten in das PDF-Format",
          feature3: "Komprimierung von PDF-Dateien",
          feature4: "Zusammenführen mehrerer PDF-Dateien",
          feature5: "Aufteilen von PDF-Dateien in separate Dokumente",
          feature6: "Drehen von PDF-Seiten",
          feature7: "Hinzufügen von Wasserzeichen zu PDF-Dateien",
          feature8: "Andere PDF-Verarbeitungsfunktionen"
        }
      },
      account: {
        title: "3. Kontoregistrierung",
        registration: "3.1. Einige Funktionen unserer Dienste erfordern möglicherweise die Registrierung eines Kontos. Bei der Registrierung erklären Sie sich damit einverstanden, genaue, aktuelle und vollständige Informationen bereitzustellen.",
        responsibility: "3.2. Sie sind für die Vertraulichkeit Ihrer Kontodaten und für alle Aktivitäten verantwortlich, die unter Ihrem Konto stattfinden.",
        security: "3.3. Sie erklären sich damit einverstanden, uns unverzüglich über jede unbefugte Nutzung Ihres Kontos oder jede andere Sicherheitsverletzung zu informieren."
      },
      obligations: {
        title: "4. Pflichten des Nutzers",
        lawfulUse: {
          title: "4.1. Rechtmäßige Nutzung.",
          description: "Sie erklären sich damit einverstanden, unsere Dienste nur für rechtmäßige Zwecke und in Übereinstimmung mit diesen Bedingungen zu nutzen. Sie erklären sich damit einverstanden, unsere Dienste nicht zu nutzen:",
          restrictions: {
            restriction1: "In einer Weise, die gegen geltende bundes-, landes-, lokale oder internationale Gesetze oder Vorschriften verstößt",
            restriction2: "Zur Übertragung von Material, das Viren, Trojaner, Würmer, Malware oder anderen schädlichen Code enthält",
            restriction3: "Zur Verletzung oder zum Verstoß gegen unsere geistigen Eigentumsrechte oder die geistigen Eigentumsrechte anderer"
          }
        },
        content: {
          title: "4.2. Eigentum und Verantwortung für Inhalte.",
          description: "Sie behalten alle Eigentumsrechte an den Dateien, die Sie auf unsere Dienste hochladen. Sie sind allein verantwortlich für den Inhalt Ihrer Dateien und die Rechtmäßigkeit des Hochladens, Verarbeitens und Herunterladens solcher Inhalte."
        },
        sensitiveInfo: {
          title: "4.3. Keine sensiblen Informationen.",
          description: "Sie erklären sich damit einverstanden, keine Dateien hochzuladen, die sensible persönliche Informationen wie Sozialversicherungsnummern, Finanzkontoinformationen, Gesundheitsinformationen oder andere Informationen enthalten, die besonderen regulatorischen Schutzbestimmungen unterliegen."
        }
      },
      privacy: {
        title: "5. Datenschutz",
        description: {
          before: "Ihre Privatsphäre ist uns wichtig. Unsere ",
          link: "Datenschutzrichtlinie",
          after: ", die durch Verweis in diese Bedingungen aufgenommen wird, erläutert, wie wir Informationen über Sie sammeln, verwenden und weitergeben."
        }
      },
      intellectual: {
        title: "6. Rechte an geistigem Eigentum",
        ownership: {
          title: "6.1. Unser geistiges Eigentum.",
          description: "Die Dienste, einschließlich aller Inhalte, Funktionen und Funktionalitäten, gehören uns, unseren Lizenzgebern oder anderen Anbietern und sind durch Urheberrechte, Markenrechte und andere Gesetze zum Schutz geistigen Eigentums geschützt."
        },
        license: {
          title: "6.2. Eingeschränkte Nutzungslizenz.",
          description: "Wir gewähren Ihnen eine eingeschränkte, nicht exklusive, nicht übertragbare und widerrufliche Lizenz zur Nutzung unserer Dienste für Ihre persönlichen oder internen geschäftlichen Zwecke."
        }
      },
      disclaimers: {
        title: "7. Haftungsausschlüsse und Haftungsbeschränkungen",
        asis: {
          title: "7.1. Dienst wird wie besehen bereitgestellt.",
          description: "Die Dienste werden auf einer WIE BESEHEN und WIE VERFÜGBAR Basis bereitgestellt, ohne jegliche Garantien, weder ausdrücklich noch stillschweigend, einschließlich, aber nicht beschränkt auf stillschweigende Garantien der Marktgängigkeit, Eignung für einen bestimmten Zweck oder Nichtverletzung."
        },
        liability: {
          title: "7.2. Haftungsbeschränkung.",
          description: "Soweit gesetzlich zulässig, haften wir oder unsere verbundenen Unternehmen, Dienstleister, Mitarbeiter, Vertreter, leitenden Angestellten oder Direktoren in keinem Fall für Schäden jeglicher Art, unter irgendeiner rechtlichen Theorie, die aus oder im Zusammenhang mit Ihrer Nutzung oder Unfähigkeit zur Nutzung der Dienste entstehen, einschließlich direkter, indirekter, besonderer, zufälliger, Folge- oder Strafschäden."
        }
      },
      termination: {
        title: "8. Laufzeit und Kündigung",
        duration: "8.1. Diese Bedingungen bleiben in vollem Umfang in Kraft, solange Sie die Dienste nutzen.",
        rights: "8.2. Wir können Ihren Zugang zu allen oder einem Teil der Dienste mit oder ohne Vorankündigung beenden oder aussetzen, für jedes Verhalten, das wir nach unserem alleinigen Ermessen als Verstoß gegen diese Bedingungen oder als schädlich für andere Nutzer der Dienste, uns oder Dritte erachten, oder aus irgendeinem anderen Grund.",
        effect: "8.3. Bei Kündigung erlischt Ihr Recht zur Nutzung der Dienste sofort."
      },
      changes: {
        title: "9. Änderungen der Bedingungen",
        description: "Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Wir werden Sie über wesentliche Änderungen informieren, indem wir die neuen Bedingungen auf den Diensten veröffentlichen und das Datum der letzten Aktualisierung anpassen. Ihre fortgesetzte Nutzung der Dienste nach solchen Änderungen stellt Ihre Zustimmung zu den neuen Bedingungen dar."
      },
      contact: {
        title: "10. Kontaktinformationen",
        description: "Wenn Sie Fragen zu diesen Bedingungen haben, kontaktieren Sie uns bitte unter:",
        email: {
          label: "E-Mail:",
          value: "support@mega-pdf.com"
        },
        address: {
          label: "Adresse:",
          value: "Indonesien, Bangka Belitung"
        }
      }
    },
    agreement: "Durch die Nutzung von MegaPDF bestätigen Sie, dass Sie diese Nutzungsbedingungen gelesen, verstanden und sich daran gebunden fühlen.",
    viewPrivacyPolicy: "Datenschutzrichtlinie anzeigen"
  },
  privacy: {
    title: "Datenschutzrichtlinie",
    meta: {
      title: "Datenschutzrichtlinie | MegaPDF - PDF-Tools",
      description: "Datenschutzrichtlinie für MegaPDF PDF-Tools. Erfahren Sie, wie wir Ihre Daten behandeln und Ihre Privatsphäre schützen."
    },
    lastUpdated: "Zuletzt aktualisiert: 18. März 2025",
    introduction: "Diese Datenschutzrichtlinie beschreibt, wie MegaPDF Informationen sammelt, verwendet und weitergibt, wenn Sie unsere Website, mobilen Anwendungen und Dienste (zusammen die Dienste) nutzen.",
    sections: {
      informationWeCollect: {
        title: "1. Informationen, die wir sammeln",
        description: "Wir sammeln verschiedene Arten von Informationen von und über Nutzer unserer Dienste:"
      },
      informationYouProvide: {
        title: "1.1. Informationen, die Sie uns bereitstellen",
        account: {
          label: "Kontoinformationen:",
          description: "Wenn Sie sich für ein Konto registrieren, sammeln wir Ihren Namen, Ihre E-Mail-Adresse und Ihr Passwort."
        },
        payment: {
          label: "Zahlungsinformationen:",
          description: "Wenn Sie Premium-Dienste kaufen, sammeln wir Zahlungsinformationen, die Kreditkartendaten, Rechnungsadresse und andere finanzielle Informationen umfassen können. Die Zahlungsabwicklung wird von unseren Drittanbietern durchgeführt, und wir speichern keine vollständigen Kreditkarteninformationen auf unseren Servern."
        },
        files: {
          label: "Dateien und Inhalte:",
          description: "Wir sammeln die Dateien, die Sie zur Verarbeitung auf unsere Dienste hochladen (wie PDFs und andere Dokumente)."
        },
        communications: {
          label: "Kommunikation:",
          description: "Wenn Sie uns direkt kontaktieren, können wir Informationen über Ihre Kommunikation und alle zusätzlichen Informationen sammeln, die Sie bereitstellen."
        }
      },
      automaticInformation: {
        title: "1.2. Informationen, die wir automatisch sammeln",
        usage: {
          label: "Nutzungsdaten:",
          description: "Wir sammeln Informationen darüber, wie Sie mit unseren Diensten interagieren, einschließlich der Funktionen, die Sie nutzen, der Zeit, die Sie auf den Diensten verbringen, und der Seiten, die Sie besuchen."
        },
        device: {
          label: "Geräte- und Verbindungsinformationen:",
          description: "Wir sammeln Informationen über Ihr Gerät und Ihre Internetverbindung, einschließlich Ihrer IP-Adresse, des Browsertyps, des Betriebssystems und der Gerätekennungen."
        },
        cookies: {
          label: "Cookies und ähnliche Technologien:",
          description: "Wir verwenden Cookies und ähnliche Tracking-Technologien, um Aktivitäten auf unseren Diensten zu verfolgen und bestimmte Informationen zu speichern. Weitere Informationen über unsere Verwendung von Cookies finden Sie in Abschnitt 5 unten."
        }
      },
      howWeUse: {
        title: "2. Wie wir Ihre Informationen verwenden",
        description: "Wir verwenden die gesammelten Informationen für verschiedene Zwecke, einschließlich um:",
        purposes: {
          purpose1: "Unsere Dienste bereitzustellen, zu warten und zu verbessern",
          purpose2: "Transaktionen zu verarbeiten und abzuschließen sowie damit verbundene Informationen, einschließlich Bestätigungen, zu senden",
          purpose3: "Administrative Informationen wie Updates, Sicherheitswarnungen und Support-Nachrichten zu senden",
          purpose4: "Auf Ihre Kommentare, Fragen und Anfragen zu antworten und Kundenservice zu bieten",
          purpose5: "Mit Ihnen über Produkte, Dienstleistungen, Angebote, Werbeaktionen und Veranstaltungen zu kommunizieren",
          purpose6: "Trends, Nutzung und Aktivitäten im Zusammenhang mit unseren Diensten zu überwachen und zu analysieren",
          purpose7: "Betrügerische Transaktionen und andere illegale Aktivitäten zu erkennen, zu untersuchen und zu verhindern",
          purpose8: "Ihre Erfahrung mit unseren Diensten zu personalisieren und zu verbessern"
        }
      },
      fileHandling: {
        title: "3. Wie wir Ihre Dateien behandeln",
        processing: {
          title: "3.1. Dateiverarbeitung",
          description: "Dateien, die Sie auf unsere Dienste hochladen, werden auf unseren Servern verarbeitet, um die gewünschte Konvertierungs- oder Manipulationsfunktion bereitzustellen. Diese Verarbeitung ist in der Regel automatisiert und beinhaltet keine menschliche Überprüfung Ihrer Inhalte."
        },
        storage: {
          title: "3.2. Dateispeicherung und -aufbewahrung",
          temporary: {
            label: "Temporäre Speicherung:",
            description: "Hochgeladene Dateien werden temporär auf unseren Servern gespeichert, um unsere Dienste bereitzustellen. Dateien werden nach 24 Stunden automatisch gelöscht, es sei denn, Sie sind ein Premium-Nutzer mit erweiterten Speicheroptionen."
          },
          converted: {
            label: "Konvertierte Dateien:",
            description: "Die resultierenden konvertierten oder verarbeiteten Dateien werden ebenfalls temporär gespeichert und stehen 24 Stunden lang zum Download zur Verfügung, danach werden sie automatisch gelöscht."
          }
        },
        security: {
          title: "3.3. Dateisicherheit",
         奇description: "Wir setzen angemessene Sicherheitsmaßnahmen ein, um Ihre Dateien vor unbefugtem Zugriff, Offenlegung, Änderung oder Zerstörung zu schützen. Bitte beachten Sie jedoch, dass keine Methode der Übertragung über das Internet oder der elektronischen Speicherung zu 100 % sicher ist."
        }
      },
      sharing: {
        title: "4. Weitergabe von Informationen",
        description: "Wir können Informationen wie folgt weitergeben:",
        serviceProviders: {
          title: "4.1. Dienstleister",
          description: "Wir können Ihre Informationen mit Drittanbietern, Dienstleistern, Auftragnehmern oder Vertretern teilen, die Dienstleistungen in unserem Namen erbringen, wie Zahlungsabwicklung, Datenanalyse, E-Mail-Zustellung, Hosting-Dienste und Kundenservice."
        },
        businessTransfers: {
          title: "4.2. Unternehmensübertragungen",
          description: "Wenn wir an einer Fusion, Übernahme, Finanzierung, Reorganisation, Insolvenz oder einem Verkauf von Unternehmensvermögen beteiligt sind, können Ihre Informationen als Teil dieser Transaktion übertragen werden."
        },
        legal: {
          title: "4.3. Gesetzliche Anforderungen",
          description: "Wir können Ihre Informationen offenlegen, wenn dies gesetzlich vorgeschrieben ist oder als Reaktion auf gültige Anfragen von öffentlichen Behörden (z. B. einem Gericht oder einer Regierungsbehörde)."
        }
      },
      cookies: {
        title: "5. Cookies und Tracking-Technologien",
        types: {
          title: "5.1. Arten von Cookies, die wir verwenden",
          essential: {
            label: "Notwendige Cookies:",
            description: "Diese Cookies sind notwendig, damit die Dienste ordnungsgemäß funktionieren."
          },
          analytics: {
            label: "Analyse-Cookies:",
            description: "Wir verwenden diese Cookies, um zu analysieren, wie Nutzer mit unseren Diensten interagieren, was uns hilft, die Funktionalität und Benutzererfahrung zu verbessern."
          },
          preference: {
            label: "Präferenz-Cookies:",
            description: "Diese Cookies ermöglichen es uns, Informationen zu speichern, die das Verhalten oder Aussehen der Dienste verändern, wie Ihre bevorzugte Sprache oder Region."
          }
        }
      },
      rights: {
        title: "6. Ihre Rechte und Wahlmöglichkeiten",
        description: "Je nach Ihrem Standort haben Sie möglicherweise bestimmte Rechte in Bezug auf Ihre persönlichen Informationen:",
        options: {
          option1: "Zugriff auf Ihre persönlichen Informationen anfordern",
          option2: "Korrektur ungenauer Informationen anfordern",
          option3: "Löschung Ihrer Informationen anfordern",
          option4: "Widerspruch gegen unsere Verarbeitung Ihrer Informationen",
          option5: "Einschränkung der Verarbeitung anfordern",
          option6: "Datenportabilität anfordern",
          option7: "Einwilligung jederzeit widerrufen, wenn die Verarbeitung auf Einwilligung basiert"
        }
      },
      contact: {
        title: "7. Kontaktinformationen",
        description: "Wenn Sie Fragen oder Bedenken zu dieser Datenschutzrichtlinie oder unseren Datenpraktiken haben, kontaktieren Sie uns bitte unter:",
        email: {
          label: "E-Mail:",
          value: "privacy@mega-pdf.com"
        },
        address: {
          label: "Adresse:",
          value: "Indonesien, Bangka Belitung"
        }
      }
    },
    acknowledgment: "Durch die Nutzung von MegaPDF bestätigen Sie, dass Sie diese Datenschutzrichtlinie gelesen und verstanden haben.",
    viewTerms: "Nutzungsbedingungen anzeigen"
},
cookies: {
  title: "Cookie-Richtlinie",
  lastUpdated: "Zuletzt aktualisiert: {date}",
  overview: "Übersicht",
  intro: "Diese Cookie-Richtlinie erklärt, was Cookies sind und wie wir sie auf unserer Website verwenden. Wir empfehlen, diese Richtlinie zu lesen, um zu verstehen, was Cookies sind, wie wir sie verwenden, welche Arten von Cookies wir verwenden und wie Sie Ihre Cookie-Präferenzen verwalten können.",
  
  tabs: {
    what: "Was sind Cookies",
    types: "Arten von Cookies",
    how: "Wie wir Cookies verwenden",
    thirdParty: "Cookies von Drittanbietern",
    manage: "Cookies verwalten"
  },
  
  whatAre: {
    title: "Was sind Cookies?",
    description: "Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät gespeichert werden, wenn Sie eine Website besuchen. Sie werden häufig verwendet, um Websites effizienter zu gestalten und Informationen für die Website-Betreiber bereitzustellen.",
    purpose: "Cookies ermöglichen es uns, Ihr Gerät zu erkennen und Ihnen ein personalisiertes Erlebnis zu bieten. Sie werden auch verwendet, um die Sicherheit Ihres Kontos zu gewährleisten, die Nutzung unseres Dienstes zu analysieren und uns bei unseren Marketingbemühungen zu unterstützen."
  },
  
  types: {
    title: "Arten von Cookies, die wir verwenden",
    essential: {
      title: "Notwendige Cookies",
      description: "Diese Cookies sind für das ordnungsgemäße Funktionieren der Website erforderlich. Sie ermöglichen grundlegende Funktionen wie Seitennavigation und Zugriff auf sichere Bereiche der Website. Ohne diese Cookies kann die Website nicht ordnungsgemäß funktionieren.",
      examples: {
        session: "Sitzungs-Cookies für die Authentifizierung",
        csrf: "CSRF-Token für die Sicherheit",
        load: "Lastverteilungs-Cookies"
      }
    },
    functional: {
      title: "Funktionale Cookies",
      description: "Diese Cookies ermöglichen es der Website, erweiterte Funktionen und Personalisierung bereitzustellen. Sie können von uns oder von Drittanbietern gesetzt werden, deren Dienste wir auf unseren Seiten hinzugefügt haben.",
      examples: {
        language: "Cookies für Sprachpräferenzen",
        theme: "Cookies für die Anpassung der Benutzeroberfläche"
      }
    },
    analytics: {
      title: "Analyse-Cookies",
      description: "Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren. Sie liefern Informationen über Metriken wie die Anzahl der Besucher, die Absprungrate, die Verkehrsquelle usw.",
      examples: {
        ga: "Google Analytics-Cookies",
        heatmap: "Cookies zur Verfolgung des Nutzerverhaltens"
      }
    },
    advertising: {
      title: "Werbe-Cookies",
      description: "Diese Cookies werden verwendet, um Besucher über Websites hinweg zu verfolgen. Ziel ist es, Anzeigen anzuzeigen, die für den einzelnen Nutzer relevant und ansprechend sind und dadurch für Publisher und Drittanbieter-Werbetreibende wertvoller sind."
    }
  },
  
  howWeUse: {
    title: "Wie wir Cookies verwenden",
    description: "Wir verwenden Cookies aus verschiedenen Gründen, einschließlich:",
    purposes: {
      authentication: "Zur Authentifizierung von Nutzern und zur Verhinderung betrügerischer Nutzung von Nutzerkonten",
      security: "Zur Verbesserung der Sicherheit unseres Dienstes",
      preferences: "Um Informationen über Ihre Präferenzen und Einstellungen zu speichern",
      analytics: "Um zu verstehen, wie Sie unsere Website nutzen, was uns ermöglicht, Funktionalität und Benutzererlebnis zu verbessern",
      features: "Um bestimmte Funktionen und Features unseres Dienstes zu ermöglichen"
    }
  },
  
  thirdParty: {
    title: "Cookies von Drittanbietern",
    description: "Zusätzlich zu unseren eigenen Cookies können wir auch verschiedene Cookies von Drittanbietern verwenden, um Nutzungsstatistiken zu berichten, Werbung zu schalten und so weiter.",
    providers: {
      analytics: "Wird verwendet, um Informationen darüber zu sammeln, wie Sie unsere Website nutzen, einschließlich der am häufigsten besuchten Seiten. Wir verwenden diese Informationen, um unsere Website und Dienstleistungen zu verbessern.",
      payment: "Wird verwendet, um Zahlungen zu verarbeiten und Betrug bei Abonnements und Käufen auf unserer Plattform zu verhindern.",
      heatmap: "Wird verwendet, um zu verstehen, wie Nutzer mit verschiedenen Elementen unserer Seiten durch Heatmaps und Sitzungsaufzeichnungen interagieren."
    }
  },
  
  manage: {
    title: "Verwalten Ihrer Cookie-Präferenzen",
    description: "Die meisten Webbrowser ermöglichen es Ihnen, Cookies über deren Einstellungspräferenzen zu kontrollieren. Wenn Sie jedoch die Fähigkeit von Websites einschränken, Cookies zu setzen, kann dies Ihr gesamtes Benutzererlebnis beeinträchtigen, und bestimmte Funktionen unserer Website funktionieren möglicherweise nicht wie vorgesehen.",
    browser: {
      title: "Browser-Steuerung",
      description: "Sie können Cookies über die Einstellungen Ihres Browsers verwalten. So geht's in gängigen Browsern:",
      chrome: "Einstellungen > Datenschutz und Sicherheit > Cookies und andere Websitedaten",
      firefox: "Optionen > Datenschutz & Sicherheit > Cookies und Websitedaten",
      safari: "Einstellungen > Datenschutz > Cookies und Websitedaten",
      edge: "Einstellungen > Cookies und Website-Berechtigungen > Cookies und Websitedaten"
    },
    warning: "Bitte beachten Sie, dass das Deaktivieren notwendiger Cookies die Funktionalität unserer Website beeinträchtigt und bestimmte Funktionen möglicherweise nicht ordnungsgemäß funktionieren."
  },
  
  contactUs: {
    title: "Kontaktieren Sie uns",
    description: "Wenn Sie Fragen zu unserer Verwendung von Cookies haben, kontaktieren Sie uns bitte unter:"
  }
},
balancePanel: {
  title: {
    currentBalance: "Aktueller Saldo",
    freeOperations: "Kostenlose Operationen",
    operationsCoverage: "Operationsabdeckung",
    transactionHistory: "Transaktionsverlauf",
    depositFunds: "Guthaben einzahlen"
  },
  description: {
    operationCost: "Operationen kosten 0,005 $ pro Stück",
    resetsOn: "Setzt zurück am {date}",
    operationsWithBalance: "Mit aktuellem Saldo verfügbare Operationen",
    transactionDescription: "Sehen Sie Ihre kürzlichen Transaktionen und Operationen",
    depositDescription: "Fügen Sie Geld zu Ihrem Konto hinzu, um es für Operationen zu verwenden",
    operationsCoverageInfo: "{count} Operationen",
    operationCostInfo: "Jede Operation kostet 0,005 $. Nicht genutzte Gelder bleiben auf Ihrem Konto."
  },
  button: {
    addFunds: "Guthaben hinzufügen",
    deposit: "Einzahlung mit PayPal",
    processing: "Wird verarbeitet..."
  },
  tabs: {
    transactions: "Transaktionen",
    deposit: "Guthaben einzahlen"
  },
  form: {
    depositAmount: "Einzahlungsbetrag (USD)",
    enterAmount: "Betrag eingeben",
    operationsCoverage: "Operationsabdeckung:"
  },
  table: {
    recentTransactions: "Kürzliche Transaktionen",
    date: "Datum",
    description: "Beschreibung",
    amount: "Betrag",
    balance: "Saldo",
    pending: "(Ausstehend)",
    failed: "(Fehlgeschlagen)"
  },
  status: {
    loading: "Transaktionen werden geladen...",
    noTransactions: "Noch keine Transaktionen"
  },
  errors: {
    invalidAmount: "Bitte geben Sie einen gültigen Betrag ein",
    minimumDeposit: "Der Mindesteinzahlungsbetrag beträgt 5,00 $",
    depositFailed: "Einzahlung konnte nicht verarbeitet werden"
  }
},
pdfTextEditor: {
  title: "PDF-Texteditor",
  description: "Extrahieren, bearbeiten und ändern Sie Text in PDF-Dokumenten mühelos mit präziser Positionskontrolle mit unserem fortschrittlichen, benutzerfreundlichen PDF-Texteditor-Tool.",
  noFileSelected: "Keine PDF-Datei ausgewählt - Laden Sie Ihr PDF-Dokument hoch, um mit der nahtlosen Textbearbeitung zu beginnen",
  extractText: "PDF-Textinhalt sofort zur einfachen Bearbeitung extrahieren",
  savePDF: "Speichern Sie Ihr bearbeitetes PDF-Dokument mit allen Änderungen",
  reset: "Setzen Sie alle Änderungen sofort auf den ursprünglichen PDF-Inhalt zurück",
  startOver: "Laden Sie eine neue PDF-Datei hoch, um mit der Textbearbeitung zu beginnen",
  editAnother: "Bearbeiten Sie ein weiteres PDF-Dokument schnell und effizient",
  pages: "PDF-Dokumentseiten für die Unterstützung der Bearbeitung mehrerer Seiten",
  page: "Einzelne PDF-Seite für gezielte Textbearbeitung",
  textBlocks: "PDF-Textblöcke für präzise Bearbeitung verfügbar",
  pageInfo: "PDF-Seiteninformationen und detaillierte Bearbeitungsoptionen",
  editText: "PDF-Textinhalt direkt und einfach bearbeiten...",
  unsavedChanges: "Nicht gespeicherte Änderungen in Ihrem PDF-Dokument erkannt",
  extractSuccess: "PDF-Text erfolgreich zur nahtlosen Bearbeitung extrahiert",
  extractFailed: "Extrahieren des Textes aus dem PDF-Dokument fehlgeschlagen - Bitte versuchen Sie es erneut",
  saveSuccess: "Bearbeitetes PDF-Dokument erfolgreich mit allen Aktualisierungen gespeichert",
  saveFailed: "Speichern der bearbeiteten PDF-Datei fehlgeschlagen - Bitte versuchen Sie es erneut",
  saveSuccessDesc: "Ihr bearbeitetes PDF-Dokument wurde mit allen Änderungen erstellt und steht zum sofortigen Download auf Ihr Gerät zum Teilen oder Speichern bereit.",
  downloadEdited: "Laden Sie Ihre bearbeitete PDF-Datei jetzt mit allen Änderungen herunter",
  noDataToSave: "Derzeit keine PDF-Daten zum Speichern verfügbar",
  resetSuccess: "PDF-Dokument erfolgreich auf den ursprünglichen Zustand zurückgesetzt",
  resetFailed: "Zurücksetzen des PDFs auf den ursprünglichen Inhalt fehlgeschlagen - Bitte versuchen Sie es erneut",
  uploading: "Ihre PDF-Datei wird zum Verarbeiten und Bearbeiten von Text hochgeladen...",
  processing: "Ihr PDF-Dokument wird zur Textbearbeitung und -änderung verarbeitet...",
  extractingText: "Text wird automatisch aus Ihrer PDF-Datei zur Bearbeitung extrahiert...",
  readyToEdit: "Ihr PDF-Dokument ist zur nahtlosen Textbearbeitung und -anpassung bereit",
  networkError: "Netzwerkfehler während der PDF-Verarbeitung aufgetreten - Überprüfen Sie Ihre Verbindung",
  unknownError: "Unbekannter Fehler im PDF-Bearbeitungsprozess aufgetreten - Bitte versuchen Sie es erneut",
  tryAgain: "Versuchen Sie, Ihr PDF-Dokument erneut zu bearbeiten, um die besten Ergebnisse zu erzielen",
  dragAndDrop: "Ziehen Sie Ihre PDF-Datei per Drag & Drop, um sofort mit der Bearbeitung zu beginnen",
  dropHereDesc: "Legen Sie Ihre PDF-Datei hier ab oder klicken Sie, um nach einfachen, automatischen Textextraktions- und Bearbeitungsmöglichkeiten zu suchen. Unser fortschrittlicher PDF-Editor macht die Textänderung einfach, effizient und für alle Benutzer zugänglich und sorgt jedes Mal für professionelle Ergebnisse.",
  howToEdit: "So bearbeiten Sie PDF-Text online schnell, einfach und genau",
  editInstructions: "Verwenden Sie den visuellen Editor, um Text anzuzeigen und zu bearbeiten, der genau so positioniert ist, wie er auf der PDF-Seite erscheint, oder wechseln Sie zum Listen-Editor für organisierte, strukturierte Textbearbeitung. Klicken Sie auf einen beliebigen Textblock, um den Inhalt mühelos auszuwählen und zu ändern, und stellen Sie so präzise Aktualisierungen Ihres PDF-Dokuments sicher, während das ursprüngliche Layout und die Formatierung erhalten bleiben.",
  visualEditor: "Visueller PDF-Texteditor für präzise und intuitive Textbearbeitung",
  listEditor: "Listenbasierter PDF-Texteditor für organisierte und strukturierte Bearbeitung",
  editingPage: "Bearbeiten einer bestimmten PDF-Seite mit hoher Präzision",
  previousPage: "Navigieren Sie zur vorherigen PDF-Seite, um mit der Bearbeitung fortzufahren",
  nextPage: "Navigieren Sie zur nächsten PDF-Seite für nahtlose Bearbeitung",
  editingBlock: "Bearbeiten eines bestimmten PDF-Textblocks mit Genauigkeit",
  editing: "Aktive Bearbeitung von PDF-Inhalten mit Echtzeit-Updates",
  editTextContent: "PDF-Textinhalt direkt und präzise bearbeiten:",
  clickToClose: "Klicken Sie auf die Kopfzeile, um die PDF-Editor-Oberfläche schnell zu schließen",
  noTextBlocks: "Auf dieser PDF-Seite wurden keine Textblöcke zur Bearbeitung gefunden",
  quickJump: "Springen Sie schnell zu einer bestimmten PDF-Seite für gezielte Bearbeitung",
  howTo: {
    title: "Schritt-für-Schritt-Anleitung zum Bearbeiten von Text in PDF-Dokumenten online",
    step1: {
      title: "Laden Sie Ihr PDF-Dokument zur Textbearbeitung hoch",
      description: "Laden Sie Ihre PDF-Datei in unseren fortschrittlichen Editor hoch, um automatisch alle Textelemente zu extrahieren und sie für eine nahtlose, präzise Bearbeitung und Änderung vorzubereiten."
    },
    step2: {
      title: "Bearbeiten Sie PDF-Textinhalt direkt und intuitiv",
      description: "Klicken Sie auf einen beliebigen Textblock innerhalb der PDF, um dessen Inhalt direkt zu bearbeiten, und machen Sie Updates schnell, intuitiv und genau mit unseren leistungsstarken PDF-Textbearbeitungstools."
    },
    step3: {
      title: "Speichern Sie Ihre PDF-Änderungen einfach und laden Sie sie herunter",
      description: "Speichern Sie Ihren bearbeiteten Text, um ein neues PDF-Dokument mit allen angewendeten Änderungen zu generieren, das sofort zum Download, zur Freigabe oder zur beruflichen Nutzung bereit ist."
    }
  },
  features: {
    title: "Leistungsstarke Funktionen unseres fortschrittlichen PDF-Texteditor-Tools",
    preserve: "Behalten Sie die ursprüngliche PDF-Formatierung, das Layout und die Textpositionierung für professionelle, hochwertige Ergebnisse bei",
    visual: "Visuelle Textblockauswahl und -bearbeitung für genaue, intuitive PDF-Modifikationen mit Echtzeit-Vorschauen",
    multipage: "Vollständige Unterstützung für mehrseitige PDF-Dokumente, die eine umfassende Bearbeitung über alle Seiten ermöglicht",
    fonts: "Detaillierte Schrift- und Größentinformationen für eine präzise Steuerung der PDF-Textbearbeitung und -Anpassung anzeigen"
  },
  useCases: {
    title: "Häufige Anwendungsfälle für die PDF-Textbearbeitung und -Änderung",
    documentTranslation: {
      title: "Dokumentübersetzung für PDF-Dateien",
      description: "Übersetzen Sie PDF-Inhalte in mehrere Sprachen und behalten Sie dabei das ursprüngliche Layout, die Formatierung und das Design für professionelle, mehrsprachige Dokumente bei."
    },
    contentCorrection: {
      title: "Inhaltskorrektur in PDF-Dokumenten",
      description: "Korrigieren Sie einfach Tippfehler, aktualisieren Sie veraltete Informationen oder beheben Sie Fehler in vorhandenen PDF-Dateien mit Präzision und Geschwindigkeit."
    },
    templateCustomization: {
      title: "PDF-Vorlagenanpassung und -Bearbeitung",
      description: "Passen Sie PDF-Vorlagen an, indem Sie Textfelder, Inhaltsbereiche und andere Elemente bearbeiten, um Ihren spezifischen Anforderungen gerecht zu werden."
    },
    rebrandingDocuments: {
      title: "Effizientes Rebranding von PDF-Dokumenten",
      description: "Aktualisieren Sie Firmennamen, Adressen, Logos und Markeninformationen in PDF-Dateien schnell und professionell."
    }
  },
  relatedTools: {
    title: "Verwandte PDF-Tools für verbesserte Produktivität und Dokumentenverwaltung",
    convertPDF: {
      title: "PDF in bearbeitbare Formate konvertieren",
      description: "Konvertieren Sie Ihre PDF-Dateien in bearbeitbare Formate wie Word, Excel oder andere Formate zur weiteren Anpassung und Bearbeitung."
    },
    watermarkPDF: {
      title: "Wasserzeichen zu PDF-Dokumenten hinzufügen",
      description: "Fügen Sie Ihren PDF-Dateien einfach Text- oder Bildwasserzeichen für Branding, Sicherheit oder professionelle Zwecke hinzu."
    },
    mergePDF: {
      title: "Mehrere PDF-Dateien zusammenführen",
      description: "Kombinieren Sie mehrere PDF-Dokumente zu einer einzigen Datei für eine optimierte Organisation, Freigabe und Verwaltung."
    },
    splitPDF: {
      title: "PDF-Seiten einfach aufteilen",
      description: "Extrahieren Sie bestimmte Seiten aus PDF-Dokumenten, um neue Dateien zu erstellen oder Inhalte effizient zu reorganisieren."
    },
  seoContent: {
  title: "Fortgeschrittene PDF-Textbearbeitung für professionelle Dokumente",
  paragraph1: "Unser fortschrittlicher PDF-Texteditor bietet professionelle Textbearbeitungsfunktionen für PDF-Dokumente. Im Gegensatz zu grundlegenden PDF-Editoren stellt unser Tool sicher, dass Textänderungen präzise vorgenommen werden, während die genaue Positionierung, Formatierung und das Layout Ihres Original-PDF erhalten bleiben, was für alle Benutzer hochwertige Ergebnisse liefert.",
  paragraph2: "Unser PDF-Editor verwendet modernste Algorithmen, um Textblöcke, Schriftdetails und Positionsdaten mit unübertroffener Genauigkeit zu extrahieren. Dadurch wird sichergestellt, dass Ihr bearbeitetes PDF das professionelle Erscheinungsbild und die Integrität des Originaldokuments beibehält, was es ideal für kritische Aktualisierungen macht.",
  paragraph3: "Perfekt für Unternehmen, Rechtsdokumente, Formulare, Verträge und jedes PDF, das Textänderungen erfordert, ohne das Gesamtdesign zu beeinträchtigen. Bearbeiten Sie PDF-Text online mühelos, egal ob für berufliche, Bildungs- oder persönliche Zwecke, mit unseren intuitiven und leistungsstarken Bearbeitungstools."
  },
    viewAllPDFTools: "Alle PDF-Tools für umfassende Dokumentenverwaltung anzeigen"
  }
}
}