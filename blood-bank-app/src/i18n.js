import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      inventory: 'Blood Inventory',
      donors: 'Donors',
      recipients: 'Recipients',
      hospitals: 'Hospitals',
      emergency: 'Emergency SOS',
      appointments: 'Appointments',
      rewards: 'Rewards',
      camps: 'Blood Camps',
      analytics: 'Analytics',
      chat: 'Messages',
      requests: 'Requests',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      noData: 'No data available',
      
      // Dashboard
      totalBloodUnits: 'Total Blood Units',
      donorsThisMonth: 'Donors This Month',
      availableUnits: 'Available Units',
      lowStockGroups: 'Low Stock Groups',
      
      // Emergency
      emergencySOS: 'Emergency SOS',
      broadcastEmergency: 'Broadcast Emergency',
      unitsNeeded: 'Units Needed',
      patientCondition: 'Patient Condition',
      urgencyLevel: 'Urgency Level',
      
      // Appointments
      bookAppointment: 'Book Appointment',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      location: 'Location',
      confirmAppointment: 'Confirm Appointment',
      
      // Rewards
      myPoints: 'My Points',
      totalDonations: 'Total Donations',
      livesSaved: 'Lives Saved',
      leaderboard: 'Leaderboard',
      badges: 'Badges',
      
      // Blood Groups
      bloodGroup: 'Blood Group'
    }
  },
  hi: {
    translation: {
      // Navigation
      dashboard: 'डैशबोर्ड',
      inventory: 'रक्त इन्वेंटरी',
      donors: 'रक्तदाता',
      recipients: 'प्राप्तकर्ता',
      hospitals: 'अस्पताल',
      emergency: 'आपातकालीन SOS',
      appointments: 'अपॉइंटमेंट',
      rewards: 'पुरस्कार',
      camps: 'रक्तदान शिविर',
      analytics: 'विश्लेषण',
      chat: 'संदेश',
      requests: 'अनुरोध',
      
      // Common
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      add: 'जोड़ें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      loading: 'लोड हो रहा है...',
      noData: 'कोई डेटा उपलब्ध नहीं है',
      
      // Dashboard
      totalBloodUnits: 'कुल रक्त यूनिट',
      donorsThisMonth: 'इस महीने रक्तदाता',
      availableUnits: 'उपलब्ध यूनिट',
      lowStockGroups: 'कम स्टॉक समूह',
      
      // Emergency
      emergencySOS: 'आपातकालीन SOS',
      broadcastEmergency: 'आपातकाल प्रसारित करें',
      unitsNeeded: 'आवश्यक यूनिट',
      patientCondition: 'रोगी की स्थिति',
      urgencyLevel: 'तात्कालिकता स्तर',
      
      // Appointments
      bookAppointment: 'अपॉइंटमेंट बुक करें',
      selectDate: 'तारीख चुनें',
      selectTime: 'समय चुनें',
      location: 'स्थान',
      confirmAppointment: 'अपॉइंटमेंट की पुष्टि करें',
      
      // Rewards
      myPoints: 'मेरे अंक',
      totalDonations: 'कुल दान',
      livesSaved: 'बचाई गई जीवन',
      leaderboard: 'लीडरबोर्ड',
      badges: 'बैज',
      
      // Blood Groups
      bloodGroup: 'रक्त समूह'
    }
  },
  es: {
    translation: {
      // Navigation
      dashboard: 'Panel',
      inventory: 'Inventario de Sangre',
      donors: 'Donantes',
      recipients: 'Recipientes',
      hospitals: 'Hospitales',
      emergency: 'Emergencia SOS',
      appointments: 'Citas',
      rewards: 'Recompensas',
      camps: 'Campamentos de Sangre',
      analytics: 'Analítica',
      chat: 'Mensajes',
      requests: 'Solicitudes',
      
      // Common
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Cargando...',
      noData: 'No hay datos disponibles',
      
      // Dashboard
      totalBloodUnits: 'Unidades Totales de Sangre',
      donorsThisMonth: 'Donantes Este Mes',
      availableUnits: 'Unidades Disponibles',
      lowStockGroups: 'Grupos de Bajo Stock',
      
      // Emergency
      emergencySOS: 'SOS de Emergencia',
      broadcastEmergency: 'Transmitir Emergencia',
      unitsNeeded: 'Unidades Necesarias',
      patientCondition: 'Condición del Paciente',
      urgencyLevel: 'Nivel de Urgencia',
      
      // Appointments
      bookAppointment: 'Reservar Cita',
      selectDate: 'Seleccionar Fecha',
      selectTime: 'Seleccionar Hora',
      location: 'Ubicación',
      confirmAppointment: 'Confirmar Cita',
      
      // Rewards
      myPoints: 'Mis Puntos',
      totalDonations: 'Donaciones Totales',
      livesSaved: 'Vidas Salvadas',
      leaderboard: 'Clasificación',
      badges: 'Insignias',
      
      // Blood Groups
      bloodGroup: 'Grupo Sanguíneo'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
