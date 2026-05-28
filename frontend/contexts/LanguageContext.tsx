import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'hi' | 'kn';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
    en: {
        'nav.home': 'Home',
        'nav.papers': 'Browse Papers',
        'nav.events': 'Events',
        'nav.dashboard': 'Dashboard',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'landing.title': 'Student Research Portal',
        'landing.tagline': 'Your Gateway to Academic Research Publishing',
        'landing.description': 'A simple platform for students to submit research papers, browse published work, and connect with the academic community.',
        'landing.getStarted': 'Get Started →',
        'landing.newUser': "New to research? Don't worry—we make it simple.",
        'howItWorks.title': 'How It Works',
        'howItWorks.subtitle': 'Three simple steps to share your research with the academic community',
        'howItWorks.step1.title': 'Create Account',
        'howItWorks.step1.desc': 'Sign up with your college email and basic information. It takes less than 2 minutes.',
        'howItWorks.step2.title': 'Submit Paper',
        'howItWorks.step2.desc': 'Upload your research paper and fill out a simple form. AI tools help with summaries.',
        'howItWorks.step3.title': 'Get Published',
        'howItWorks.step3.desc': 'After faculty review and approval, your paper becomes publicly available.',
        'features.title': 'Portal Features',
        'features.subtitle': 'Everything you need for academic research management',
        'features.repository': 'Paper Repository',
        'features.repository.desc': 'Browse and download approved research papers from all departments.',
        'features.search': 'Advanced Search',
        'features.search.desc': 'Filter by department, year, type, and keywords to find relevant research.',
        'features.track': 'Track Submissions',
        'features.track.desc': 'Monitor the status of your papers—pending, approved, or needs revision.',
        'features.events': 'Event Calendar',
        'features.events.desc': 'Stay updated on seminars, workshops, and research conferences.',
        'features.ai': 'AI Assistant',
        'features.ai.desc': 'Generate summaries and check for plagiarism with AI-powered tools.',
        'features.review': 'Faculty Review',
        'features.review.desc': 'Get expert feedback from faculty members in your department.',
        'cta.title': 'Ready to Share Your Research?',
        'cta.subtitle': 'Join hundreds of students showcasing their academic work.',
        'cta.createAccount': 'Create Free Account',
        'cta.browseResearch': 'Browse Research',
        'login.title': 'Welcome Back',
        'login.subtitle': 'Sign in to access your research portal',
        'login.email': 'Email Address',
        'login.email.helper': 'Use your college email address',
        'login.password': 'Password',
        'login.submit': 'Sign In',
        'login.submitting': 'Signing in...',
        'login.backToHome': 'Back to Home',
        'common.loading': 'Loading...',
        // Register
        'register.title': 'Create Account',
        'register.subtitle': 'Join the research community',
        'register.fullname': 'Full Name',
        'register.role': 'Role',
        'register.submit': 'Create Account',
        'register.haveAccount': 'Already have an account?',
        'register.signIn': 'Sign In',
        'register.select': 'Select',
    },
    es: {
        'nav.home': 'Inicio',
        'nav.papers': 'Explorar Artículos',
        'nav.events': 'Eventos',
        'nav.dashboard': 'Panel',
        'nav.login': 'Iniciar Sesión',
        'nav.register': 'Registrarse',
        'landing.title': 'Portal de Investigación Estudiantil',
        'landing.tagline': 'Tu Puerta de Entrada a la Publicación de Investigación Académica',
        'landing.description': 'Una plataforma simple para que los estudiantes envíen trabajos de investigación, naveguen por trabajos publicados y se conecten con la comunidad académica.',
        'landing.getStarted': 'Comenzar →',
        'howItWorks.title': 'Cómo Funciona',
        'features.title': 'Características del Portal',
        'cta.title': '¿Listo para Compartir tu Investigación?',
        'login.title': 'Bienvenido de Nuevo',
        'login.submit': 'Iniciar Sesión',
        'common.loading': 'Cargando...',
        // Register
        'register.title': 'Crear Cuenta',
        'register.subtitle': 'Únete a la comunidad de investigación',
        'register.fullname': 'Nombre Completo',
        'register.role': 'Rol',
        'register.submit': 'Crear Cuenta',
        'register.haveAccount': '¿Ya tienes una cuenta?',
        'register.signIn': 'Iniciar Sesión',
        'register.select': 'Seleccionar',
    },
    fr: {
        'nav.home': 'Accueil',
        'nav.papers': 'Parcourir les Articles',
        'nav.events': 'Événements',
        'nav.dashboard': 'Tableau de Bord',
        'nav.login': 'Connexion',
        'nav.register': "S'inscrire",
        'landing.title': 'Portail de Recherche Étudiant',
        'landing.tagline': 'Votre Porte vers la Publication de Recherche Académique',
        'landing.getStarted': 'Commencer →',
        'howItWorks.title': 'Comment ça Marche',
        'features.title': 'Fonctionnalités du Portail',
        'cta.title': 'Prêt à Partager vos Recherches?',
        'login.title': 'Bienvenue',
        'login.submit': 'Se Connecter',
        'common.loading': 'Chargement...',
        // Register
        'register.title': 'Créer un Compte',
        'register.subtitle': 'Rejoignez la communauté de recherche',
        'register.fullname': 'Nom Complet',
        'register.role': 'Rôle',
        'register.submit': 'Créer un Compte',
        'register.haveAccount': 'Vous avez déjà un compte ?',
        'register.signIn': 'Se Connecter',
        'register.select': 'Sélectionner',
    },
    hi: {
        'nav.home': 'होम',
        'nav.papers': 'पेपर ब्राउज़ करें',
        'nav.events': 'कार्यक्रम',
        'nav.dashboard': 'डैशबोर्ड',
        'nav.login': 'लॉगिन',
        'nav.register': 'रजिस्टर',
        'landing.title': 'छात्र अनुसंधान पोर्टल',
        'landing.tagline': 'अकादमिक अनुसंधान प्रकाशन का आपका द्वार',
        'landing.getStarted': 'शुरू करें →',
        'howItWorks.title': 'यह कैसे काम करता है',
        'features.title': 'पोर्टल सुविधाएँ',
        'cta.title': 'अपना शोध साझा करने के लिए तैयार हैं?',
        'login.title': 'वापस स्वागत है',
        'login.submit': 'साइन इन करें',
        'common.loading': 'लोड हो रहा है...',
        // Register
        'register.title': 'खाता बनाएं',
        'register.subtitle': 'अनुसंधान समुदाय में शामिल हों',
        'register.fullname': 'पूरा नाम',
        'register.role': 'भूमिका',
        'register.submit': 'खाता बनाएं',
        'register.haveAccount': 'क्या आपके पास पहले से एक खाता है?',
        'register.signIn': 'साइन इन करें',
        'register.select': 'चुनें',
    },
    kn: {
        'nav.home': 'ಮುಖಪುಟ',
        'nav.papers': 'ಪೇಪರ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
        'nav.events': 'ಕಾರ್ಯಕ್ರಮಗಳು',
        'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'nav.login': 'ಲಾಗಿನ್',
        'nav.register': 'ನೋಂದಣಿ',
        'landing.title': 'ವಿದ್ಯಾರ್ಥಿ ಸಂಶೋಧನಾ ಪೋರ್ಟಲ್',
        'landing.tagline': 'ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನಾ ಪ್ರಕಟಣೆಗೆ ನಿಮ್ಮ ಪ್ರವೇಶದ್ವಾರ',
        'landing.description': 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸಂಶೋಧನಾ ಪತ್ರಿಕೆಗಳನ್ನು ಸಲ್ಲಿಸಲು, ಪ್ರಕಟಿಸಿದ ಕೃತಿಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಸಮುದಾಯದೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಸರಳ ವೇದಿಕೆ.',
        'landing.getStarted': 'ಪ್ರಾರಂಭಿಸಿ →',
        'landing.newUser': 'ಸಂಶೋಧನೆಗೆ ಹೊಸಬರೇ? ಚಿಂತಿಸಬೇಡಿ—ನಾವು ಅದನ್ನು ಸರಳಗೊಳಿಸುತ್ತೇವೆ.',
        'howItWorks.title': 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
        'howItWorks.subtitle': 'ಶೈಕ್ಷಣಿಕ ಸಮುದಾಯದೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಶೋಧನೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಮೂರು ಸರಳ ಹಂತಗಳು',
        'howItWorks.step1.title': 'ಖಾತೆ ರಚಿಸಿ',
        'howItWorks.step2.title': 'ಪತ್ರಿಕೆ ಸಲ್ಲಿಸಿ',
        'howItWorks.step3.title': 'ಪ್ರಕಟಿಸಿ',
        'features.title': 'ಪೋರ್ಟಲ್ ವೈಶಿಷ್ಟ್ಯಗಳು',
        'features.subtitle': 'ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನಾ ನಿರ್ವಹಣೆಗೆ ನಿಮಗೆ ಬೇಕಾದುದೆಲ್ಲವೂ',
        'features.repository': 'ಪೇಪರ್ ಭಂಡಾರ',
        'features.search': 'ಸುಧಾರಿತ ಹುಡುಕಾಟ',
        'features.track': 'ಸಲ್ಲಿಕೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
        'features.events': 'ಕಾರ್ಯಕ್ರಮ ಕ್ಯಾಲೆಂಡರ್',
        'features.ai': 'AI ಸಹಾಯಕ',
        'features.review': 'ಶಿಕ್ಷಕ ವಿಮರ್ಶೆ',
        'cta.title': 'ನಿಮ್ಮ ಸಂಶೋಧನೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಾ?',
        'cta.createAccount': 'ಉಚಿತ ಖಾತೆ ರಚಿಸಿ',
        'cta.browseResearch': 'ಸಂಶೋಧನೆ ವೀಕ್ಷಿಸಿ',
        'login.title': 'ಮರಳಿ ಸ್ವಾಗತ',
        'login.subtitle': 'ನಿಮ್ಮ ಸಂಶೋಧನಾ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
        'login.email': 'ಇಮೇಲ್ ವಿಳಾಸ',
        'login.password': 'ಪಾಸ್ವರ್ಡ್',
        'login.submit': 'ಸೈನ್ ಇನ್',
        'login.backToHome': 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
        'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
        // Register
        'register.title': 'ಖಾತೆ ರಚಿಸಿ',
        'register.subtitle': 'ಸಂಶೋಧನಾ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ',
        'register.fullname': 'ಪೂರ್ಣ ಹೆಸರು',
        'register.role': 'ಪಾತ್ರ',
        'register.submit': 'ಖಾತೆ ರಚಿಸಿ',
        'register.haveAccount': 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?',
        'register.signIn': 'ಸೈನ್ ಇನ್',
        'register.select': 'ಆರಿಸಿ',
    },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
