import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Room,
  Patient,
  UnregisteredQueue,
  Assignment,
  Notification,
  DashboardState,
  PatientFormData,
} from '../types';
import * as api from '../services/mockApi';

interface DashboardContextType extends DashboardState {
  allPatients: Patient[]; // All patients including completed (for statistics)
  notifications: Notification[];
  assignPatient: (patientId: string, roomId: string) => Promise<void>;
  completeConsultation: (roomId: string) => Promise<void>;
  toggleRoomPause: (roomId: string) => Promise<void>;
  registerPatient: (queueNumber: number, formData: PatientFormData) => Promise<void>;
  updatePatient: (patientId: string, updates: Partial<PatientFormData>) => Promise<void>;
  cancelPatient: (patientId: string, reason: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addNotification: (type: Notification['type'], message: string) => void;
  clearNotification: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>({
    rooms: [],
    registeredPatients: [],
    unregisteredQueue: [],
    assignments: [],
    isConnected: true,
    lastSync: null,
  });

  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      const [roomsRes, patientsRes, allPatientsRes, unregRes] = await Promise.all([
        api.getRooms(),
        api.getRegisteredPatients(),
        api.getAllPatients(),
        api.getUnregisteredQueue(),
      ]);

      setState(prev => ({
        ...prev,
        rooms: roomsRes.data || [],
        registeredPatients: patientsRes.data || [],
        unregisteredQueue: unregRes.data || [],
        isConnected: true,
        lastSync: new Date(),
      }));

      setAllPatients(allPatientsRes.data || []);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setState(prev => ({ ...prev, isConnected: false }));
    }
  };

  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      autoClose: type === 'success',
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.autoClose) {
      setTimeout(() => {
        clearNotification(notification.id);
      }, 5000);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const assignPatient = async (patientId: string, roomId: string) => {
    const result = await api.assignPatientToRoom(patientId, roomId);
    if (result.success) {
      await refreshData();
      addNotification('success', 'Patient assigned successfully');
    } else {
      addNotification('error', result.error || 'Failed to assign patient');
      throw new Error(result.error);
    }
  };

  const completeConsultation = async (roomId: string) => {
    const result = await api.completeConsultation(roomId);
    if (result.success) {
      await refreshData();
      addNotification('success', 'Consultation completed');
    } else {
      addNotification('error', result.error || 'Failed to complete consultation');
      throw new Error(result.error);
    }
  };

  const toggleRoomPause = async (roomId: string) => {
    const result = await api.toggleRoomPause(roomId);
    if (result.success) {
      await refreshData();
      addNotification('info', `Room ${result.data?.status === 'paused' ? 'paused' : 'resumed'}`);
    } else {
      addNotification('error', result.error || 'Failed to toggle room status');
      throw new Error(result.error);
    }
  };

  const registerPatient = async (queueNumber: number, formData: PatientFormData) => {
    const result = await api.registerPatient(queueNumber, formData);
    if (result.success) {
      await refreshData();
      addNotification('success', 'Patient registered successfully');
    } else {
      addNotification('error', result.error || 'Failed to register patient');
      throw new Error(result.error);
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<PatientFormData>) => {
    const result = await api.updatePatient(patientId, updates);
    if (result.success) {
      await refreshData();
      addNotification('success', 'Patient details updated');
    } else {
      addNotification('error', result.error || 'Failed to update patient');
      throw new Error(result.error);
    }
  };

  const cancelPatient = async (patientId: string, reason: string) => {
    const result = await api.cancelPatient(patientId, reason);
    if (result.success) {
      await refreshData();
      addNotification('warning', 'Patient cancelled');
    } else {
      addNotification('error', result.error || 'Failed to cancel patient');
      throw new Error(result.error);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        allPatients,
        notifications,
        assignPatient,
        completeConsultation,
        toggleRoomPause,
        registerPatient,
        updatePatient,
        cancelPatient,
        refreshData,
        addNotification,
        clearNotification,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
