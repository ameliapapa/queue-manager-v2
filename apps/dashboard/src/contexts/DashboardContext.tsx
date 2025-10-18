import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@shared/firebase/config';
import {
  Room,
  Patient,
  UnregisteredQueue,
  Assignment,
  Notification,
  DashboardState,
  PatientFormData,
} from '../types';
import * as api from '../services/firebaseApi';

interface DashboardContextType extends DashboardState {
  allPatients: Patient[]; // All patients including completed (for statistics)
  notifications: Notification[];
  assignPatient: (patientId: string, roomId: string) => Promise<void>;
  completeConsultation: (roomId: string) => Promise<void>;
  toggleRoomPause: (roomId: string) => Promise<void>;
  registerPatient: (queueNumber: number, formData: PatientFormData) => Promise<void>;
  updatePatient: (patientId: string, updates: Partial<PatientFormData>) => Promise<void>;
  cancelPatient: (patientId: string, reason: string) => Promise<void>;
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

  // Helper function to get today's date string
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // ✅ OPTIMIZED: Set up Firestore real-time listeners (replaces WebSocket + polling)
  useEffect(() => {
    console.log('🔄 Setting up Firestore real-time listeners...');

    const unsubscribers: (() => void)[] = [];
    const dateString = getTodayDateString();

    // Listener 1: Registered patients
    const registeredQ = query(
      collection(db, 'patients'),
      where('status', '==', 'registered'),
      orderBy('queueNumber', 'asc'),
      limit(100)
    );

    const unsubRegistered = onSnapshot(
      registeredQ,
      (snapshot) => {
        const patients = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();

          // Only include today's patients
          if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
            return null;
          }

          return {
            id: doc.id,
            queueNumber: data.queueNumber,
            name: data.name,
            phone: data.phone,
            age: data.age,
            gender: data.gender,
            notes: data.notes,
            status: data.status,
            registeredAt: data.registeredAt?.toDate(),
            assignedAt: data.assignedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            roomId: data.roomId,
            editHistory: data.editHistory,
          } as Patient;
        }).filter(p => p !== null) as Patient[];

        setState(prev => ({
          ...prev,
          registeredPatients: patients,
          lastSync: new Date(),
          isConnected: true,
        }));
        console.log('✅ Registered patients updated:', patients.length);
      },
      (error) => {
        console.error('❌ Error listening to registered patients:', error);
        setState(prev => ({ ...prev, isConnected: false }));
      }
    );
    unsubscribers.push(unsubRegistered);

    // Listener 2: Unregistered patients (status: 'pending')
    const unregisteredQ = query(
      collection(db, 'patients'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubUnregistered = onSnapshot(
      unregisteredQ,
      (snapshot) => {
        const queue = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();

          // Only include today's patients
          if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
            return null;
          }

          return {
            id: doc.id,
            queueNumber: data.queueNumber,
            issuedAt: data.issuedAt?.toDate() || createdAt,
          } as UnregisteredQueue;
        }).filter(q => q !== null) as UnregisteredQueue[];

        setState(prev => ({
          ...prev,
          unregisteredQueue: queue,
        }));
        console.log('✅ Unregistered queue updated:', queue.length);
      },
      (error) => {
        console.error('❌ Error listening to unregistered queue:', error);
      }
    );
    unsubscribers.push(unsubUnregistered);

    // Listener 3: All rooms
    const roomsQ = query(
      collection(db, 'rooms'),
      orderBy('roomNumber', 'asc')
    );

    const unsubRooms = onSnapshot(
      roomsQ,
      (snapshot) => {
        const rooms = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            roomNumber: data.roomNumber,
            doctorName: data.doctorName,
            status: data.status,
            currentPatient: data.currentPatient,
            lastUpdated: data.lastUpdated?.toDate(),
          } as Room;
        });

        setState(prev => ({
          ...prev,
          rooms,
        }));
        console.log('✅ Rooms updated:', rooms.length);
      },
      (error) => {
        console.error('❌ Error listening to rooms:', error);
      }
    );
    unsubscribers.push(unsubRooms);

    // Listener 4: All patients (for statistics)
    const allPatientsQ = query(
      collection(db, 'patients'),
      orderBy('createdAt', 'desc'),
      limit(500)
    );

    const unsubAllPatients = onSnapshot(
      allPatientsQ,
      (snapshot) => {
        const patients = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();

          // Only include today's patients
          if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
            return null;
          }

          return {
            id: doc.id,
            queueNumber: data.queueNumber,
            name: data.name,
            phone: data.phone,
            age: data.age,
            gender: data.gender,
            notes: data.notes,
            status: data.status,
            registeredAt: data.registeredAt?.toDate(),
            assignedAt: data.assignedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            roomId: data.roomId,
            editHistory: data.editHistory,
          } as Patient;
        }).filter(p => p !== null) as Patient[];

        setAllPatients(patients);
        console.log('✅ All patients updated:', patients.length);
      },
      (error) => {
        console.error('❌ Error listening to all patients:', error);
      }
    );
    unsubscribers.push(unsubAllPatients);

    // Cleanup: unsubscribe from all listeners on unmount
    return () => {
      console.log('🧹 Cleaning up Firestore listeners...');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []); // ✅ Only run ONCE on mount

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
      // ✅ No need to refresh - Firestore listeners will update automatically
      addNotification('success', 'Patient assigned successfully');
    } else {
      addNotification('error', result.error || 'Failed to assign patient');
      throw new Error(result.error);
    }
  };

  const completeConsultation = async (roomId: string) => {
    const result = await api.completeConsultation(roomId);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('success', 'Consultation completed');
    } else {
      addNotification('error', result.error || 'Failed to complete consultation');
      throw new Error(result.error);
    }
  };

  const toggleRoomPause = async (roomId: string) => {
    const result = await api.toggleRoomPause(roomId);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('info', `Room ${result.data?.status === 'paused' ? 'paused' : 'resumed'}`);
    } else {
      addNotification('error', result.error || 'Failed to toggle room status');
      throw new Error(result.error);
    }
  };

  const registerPatient = async (queueNumber: number, formData: PatientFormData) => {
    const result = await api.registerPatient(queueNumber, formData);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('success', 'Patient registered successfully');
    } else {
      addNotification('error', result.error || 'Failed to register patient');
      throw new Error(result.error);
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<PatientFormData>) => {
    const result = await api.updatePatient(patientId, updates);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('success', 'Patient details updated');
    } else {
      addNotification('error', result.error || 'Failed to update patient');
      throw new Error(result.error);
    }
  };

  const cancelPatient = async (patientId: string, reason: string) => {
    const result = await api.cancelPatient(patientId, reason);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
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
