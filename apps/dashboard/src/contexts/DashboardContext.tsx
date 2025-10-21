import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
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
    const unsubscribers: (() => void)[] = [];
    const dateString = getTodayDateString();

    // Listener 1: Registered patients
    // ✅ OPTIMIZED: Use snapshot changes for incremental updates
    // Note: Removed orderBy to avoid needing composite index - sort in JS instead
    const registeredQ = query(
      collection(db, 'patients'),
      where('status', '==', 'registered'),
      limit(100)
    );

    const unsubRegistered = onSnapshot(
      registeredQ,
      (snapshot) => {
        // ✅ OPTIMIZED: Only process changed documents
        setState(prev => {
          const patientsMap = new Map(prev.registeredPatients.map(p => [p.id, p]));

          snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();

            // Only include today's patients
            if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
              if (change.type === 'removed' || change.type === 'modified') {
                patientsMap.delete(doc.id);
              }
              return;
            }

            const patient: Patient = {
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
            };

            if (change.type === 'removed') {
              patientsMap.delete(doc.id);
            } else {
              patientsMap.set(doc.id, patient);
            }
          });

          const patients = Array.from(patientsMap.values())
            .sort((a, b) => a.queueNumber - b.queueNumber); // ✅ Sort by queue number ascending

          return {
            ...prev,
            registeredPatients: patients,
            lastSync: new Date(),
            isConnected: true,
          };
        });
      },
      (error) => {
        console.error('❌ Error listening to registered patients:', error);
        setState(prev => ({ ...prev, isConnected: false }));
      }
    );
    unsubscribers.push(unsubRegistered);

    // Listener 2: Unregistered patients (status: 'pending')
    // ✅ OPTIMIZED: Use snapshot changes for incremental updates
    // Note: Removed orderBy to avoid needing composite index - sort in JS instead
    const unregisteredQ = query(
      collection(db, 'patients'),
      where('status', '==', 'pending'),
      limit(100)
    );

    const unsubUnregistered = onSnapshot(
      unregisteredQ,
      (snapshot) => {
        // ✅ OPTIMIZED: Only process changed documents
        setState(prev => {
          const queueMap = new Map(prev.unregisteredQueue.map(q => [q.id, q]));

          snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();

            // Only include today's patients
            if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
              if (change.type === 'removed' || change.type === 'modified') {
                queueMap.delete(doc.id);
              }
              return;
            }

            const queueItem: UnregisteredQueue = {
              id: doc.id,
              queueNumber: data.queueNumber,
              issuedAt: data.issuedAt?.toDate() || createdAt,
            };

            if (change.type === 'removed') {
              queueMap.delete(doc.id);
            } else {
              queueMap.set(doc.id, queueItem);
            }
          });

          // Sort by issuedAt descending (newest first)
          const queue = Array.from(queueMap.values()).sort((a, b) => {
            const timeA = a.issuedAt?.getTime() || 0;
            const timeB = b.issuedAt?.getTime() || 0;
            return timeB - timeA;
          });

          return {
            ...prev,
            unregisteredQueue: queue,
          };
        });
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
        // ✅ OPTIMIZED: Use docChanges for incremental updates
        setState(prev => {
          const roomsMap = new Map(prev.rooms.map(r => [r.id, r]));

          snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const data = doc.data();

            const room: Room = {
              id: doc.id,
              roomNumber: data.roomNumber,
              doctorName: data.doctorName,
              status: data.status,
              currentPatient: data.currentPatient,
              lastUpdated: data.lastUpdated?.toDate(),
            };

            if (change.type === 'removed') {
              roomsMap.delete(doc.id);
            } else {
              roomsMap.set(doc.id, room);
            }
          });

          const rooms = Array.from(roomsMap.values());
          return {
            ...prev,
            rooms,
          };
        });
      },
      (error) => {
        console.error('❌ Error listening to rooms:', error);
      }
    );
    unsubscribers.push(unsubRooms);

    // Listener 4: All patients (for statistics)
    // ✅ OPTIMIZED: Use snapshot changes to only process modified docs
    const allPatientsQ = query(
      collection(db, 'patients'),
      orderBy('createdAt', 'desc'),
      limit(200) // Reduced from 500
    );

    const unsubAllPatients = onSnapshot(
      allPatientsQ,
      (snapshot) => {
        // ✅ OPTIMIZED: Only process changed documents, not all documents
        setAllPatients(prev => {
          const patientsMap = new Map(prev.map(p => [p.id, p]));

          snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();

            // Only include today's patients
            if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
              if (change.type === 'removed' || change.type === 'modified') {
                patientsMap.delete(doc.id);
              }
              return;
            }

            const patient: Patient = {
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
            };

            if (change.type === 'removed') {
              patientsMap.delete(doc.id);
            } else {
              patientsMap.set(doc.id, patient);
            }
          });

          const patients = Array.from(patientsMap.values());
          return patients;
        });
      },
      (error) => {
        console.error('❌ Error listening to all patients:', error);
      }
    );
    unsubscribers.push(unsubAllPatients);

    // Cleanup: unsubscribe from all listeners on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []); // ✅ Only run ONCE on mount

  // ✅ OPTIMIZED: Wrap with useCallback to prevent re-renders
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
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
  }, [clearNotification]);

  const assignPatient = useCallback(async (patientId: string, roomId: string) => {
    const result = await api.assignPatientToRoom(patientId, roomId);
    if (result.success) {
      // ✅ No need to refresh - Firestore listeners will update automatically
      addNotification('success', 'Patient assigned successfully');
    } else {
      addNotification('error', result.error || 'Failed to assign patient');
      throw new Error(result.error);
    }
  }, [addNotification]);

  const completeConsultation = useCallback(async (roomId: string) => {
    const result = await api.completeConsultation(roomId);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('success', 'Consultation completed');
    } else {
      addNotification('error', result.error || 'Failed to complete consultation');
      throw new Error(result.error);
    }
  }, [addNotification]);

  const toggleRoomPause = useCallback(async (roomId: string) => {
    const result = await api.toggleRoomPause(roomId);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('info', `Room ${result.data?.status === 'paused' ? 'paused' : 'resumed'}`);
    } else {
      addNotification('error', result.error || 'Failed to toggle room status');
      throw new Error(result.error);
    }
  }, [addNotification]);

  const registerPatient = useCallback(async (queueNumber: number, formData: PatientFormData) => {
    const result = await api.registerPatient(queueNumber, formData);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('success', 'Patient registered successfully');
    } else {
      addNotification('error', result.error || 'Failed to register patient');
      throw new Error(result.error);
    }
  }, [addNotification]);

  const updatePatient = useCallback(async (patientId: string, updates: Partial<PatientFormData>) => {
    const result = await api.updatePatient(patientId, updates);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('success', 'Patient details updated');
    } else {
      addNotification('error', result.error || 'Failed to update patient');
      throw new Error(result.error);
    }
  }, [addNotification]);

  const cancelPatient = useCallback(async (patientId: string, reason: string) => {
    const result = await api.cancelPatient(patientId, reason);
    if (result.success) {
      // ✅ Real-time listeners will update automatically
      addNotification('warning', 'Patient cancelled');
    } else {
      addNotification('error', result.error || 'Failed to cancel patient');
      throw new Error(result.error);
    }
  }, [addNotification]);

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
