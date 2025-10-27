import { useState, useEffect, useRef } from 'react';
import { Room } from '../services/dataService';

interface RoomStatusProps {
  rooms: Room[];
}

function RoomStatus({ rooms }: RoomStatusProps) {
  const [highlightedRooms, setHighlightedRooms] = useState<Set<number>>(new Set());
  const previousRoomsRef = useRef<Map<number, number | undefined>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on component mount
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5; // Set volume to 50%
    audioRef.current.setAttribute('preload', 'auto');

    console.log('🔊 Audio system initialized');
    console.log('📱 Tip: Click anywhere on the page to enable sound notifications');

    // Attempt to unlock audio on first user interaction
    const unlockAudio = () => {
      if (audioRef.current) {
        console.log('👆 User interaction detected - attempting to unlock audio');
        audioRef.current.play()
          .then(() => {
            audioRef.current!.pause();
            audioRef.current!.currentTime = 0;
            console.log('✅ Audio unlocked successfully! Future notifications will play sound.');
          })
          .catch((error) => {
            console.log('⚠️ Audio unlock failed:', error.message);
          });
      }
      // Remove listener after first interaction
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    // Listen for any user interaction to unlock audio
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Clean up event listeners
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    if (!audioRef.current) {
      console.log('🔇 Audio ref is null - cannot play sound');
      return;
    }

    console.log('🔊 Attempting to play notification sound');

    // Reset to start and attempt to play
    audioRef.current.currentTime = 0;
    audioRef.current.play()
      .then(() => {
        console.log('✅ Sound played successfully');
      })
      .catch((error) => {
        console.log('⚠️ Autoplay blocked by browser:', error.message);
        console.log('💡 Click anywhere on the page to enable sound for future notifications');
      });
  };

  // Track if this is the initial mount to avoid playing sound on first load
  const isInitialMount = useRef(true);

  // Track room patient changes and trigger animation
  useEffect(() => {
    // Skip sound and animation on initial mount - only play when rooms actually change
    if (isInitialMount.current) {
      console.log('📍 Initial mount - setting up room tracking');
      // Initialize the previous rooms reference with current state
      rooms.forEach((room) => {
        previousRoomsRef.current.set(room.number, room.currentPatient?.queueNumber);
        console.log(`  Room ${room.number}: ${room.currentPatient?.queueNumber ?? 'empty'}`);
      });
      isInitialMount.current = false;
      return;
    }

    console.log('🔄 Checking for room changes...');
    const newHighlightedRooms = new Set<number>();

    rooms.forEach((room) => {
      const previousPatientId = previousRoomsRef.current.get(room.number);
      const currentPatientId = room.currentPatient?.queueNumber;

      // Only trigger if:
      // 1. Room previously had no patient (previousPatientId === undefined) AND now has one
      // 2. Room had a patient but now has a different patient
      // This prevents triggering on initial load when previousRoomsRef is already populated
      if (currentPatientId !== undefined &&
          previousPatientId !== currentPatientId &&
          previousRoomsRef.current.has(room.number)) {
        // This room had a state change (either from empty to occupied, or patient changed)
        console.log(`🆕 NEW patient assignment detected!`);
        console.log(`  Room ${room.number}: ${previousPatientId ?? 'empty'} → ${currentPatientId}`);
        newHighlightedRooms.add(room.number);

        // Remove highlight after 30 seconds
        setTimeout(() => {
          setHighlightedRooms((prev) => {
            const updated = new Set(prev);
            updated.delete(room.number);
            return updated;
          });
        }, 30000);
      }

      // Update previous state
      previousRoomsRef.current.set(room.number, currentPatientId);
    });

    if (newHighlightedRooms.size > 0) {
      console.log(`🎯 ${newHighlightedRooms.size} new assignment(s) - triggering notification`);
      setHighlightedRooms((prev) => new Set([...prev, ...newHighlightedRooms]));
      // Play notification sound when new patients are assigned
      playNotificationSound();
    } else {
      console.log('  No new assignments detected');
    }
  }, [rooms]);

  return (
    <div className="flex flex-col h-full p-5">
      {/* Header */}
      <div
        className="rounded-2xl mb-5 flex items-center justify-center"
        style={{ backgroundColor: '#a03c52', height: '70px' }}
      >
        <h2
          className="text-4xl font-normal text-white text-center"
          style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.5px' }}
        >
          Dhomat e Konsultimit
        </h2>
      </div>

      {/* Room Cards - Grid Layout */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4">
        {rooms.map((room) => {
          const isHighlighted = highlightedRooms.has(room.number);
          const isBusy = room.status === 'busy';
          const isPaused = room.status === 'paused';
          const isAvailable = room.status === 'available';

          return (
            <div
              key={room.number}
              className="border-4 border-gray-200 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-500"
              style={{
                backgroundColor: '#fafafa'
              }}
            >
              {/* Room name and status */}
              <div className="flex items-center justify-between">
                <h3
                  className="text-4xl font-normal"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#1e2939' }}
                >
                  Dhoma {room.number}
                </h3>

                {/* Status badge */}
                <div
                  className="rounded-xl px-4 py-2"
                  style={{
                    backgroundColor: isAvailable ? '#00c950' : isPaused ? '#99a1af' : '#a03c52',
                    height: '44px'
                  }}
                >
                  <p
                    className="text-xl font-normal text-white whitespace-nowrap"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {isAvailable ? 'E lirë' : isPaused ? 'E Ndërprerë' : 'Në konsultim'}
                  </p>
                </div>
              </div>

              {/* Queue number box */}
              <div
                className={`bg-white rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
                  isHighlighted ? 'queue-number-highlight' : ''
                }`}
                style={{
                  borderColor: isHighlighted ? '#a03c52' : (isBusy ? '#a03c52' : '#d1d5dc'),
                  height: room.currentPatient ? '85px' : '68px',
                  backgroundColor: isHighlighted ? '#a03c52' : 'white'
                }}
              >
                {room.currentPatient ? (
                  <p
                    className="text-5xl text-center transition-all duration-500"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      letterSpacing: '2.4px',
                      color: isHighlighted ? 'white' : '#a03c52',
                      fontWeight: isHighlighted ? 'bold' : 'normal'
                    }}
                  >
                    {String(room.currentPatient.queueNumber).padStart(3, '0')}
                  </p>
                ) : (
                  <p
                    className="text-2xl font-normal text-center"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      color: '#99a1af'
                    }}
                  >
                    - - -
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Export without memo to ensure notification sound triggers properly
export default RoomStatus;
