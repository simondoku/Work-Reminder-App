import React, { useState, useEffect } from 'react';

// Custom theme colors
const colors = {
  lavender: '#E6E6FA',
  lightLavender: '#F0E6FF',
  darkLavender: '#9370DB',
  sage: '#BCB88A',
  lightSage: '#D1D9CE',
  darkSage: '#8A9A5B',
};

const WorkReminderApp = () => {
  const [workdays, setWorkdays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  });
  
  const [workTitle, setWorkTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminders, setReminders] = useState([]);
  const [dismissedReminders, setDismissedReminders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isReminderActive, setIsReminderActive] = useState(true);
  
  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    // Load saved settings from localStorage
    const savedWorkdays = localStorage.getItem('workdays');
    const savedReminderTime = localStorage.getItem('reminderTime');
    const savedIsActive = localStorage.getItem('isReminderActive');
    const savedDismissed = localStorage.getItem('dismissedReminders');
    const savedWorkTitle = localStorage.getItem('workTitle');
    
    if (savedWorkdays) setWorkdays(JSON.parse(savedWorkdays));
    if (savedReminderTime) setReminderTime(savedReminderTime);
    if (savedIsActive) setIsReminderActive(JSON.parse(savedIsActive));
    if (savedDismissed) setDismissedReminders(JSON.parse(savedDismissed));
    if (savedWorkTitle) setWorkTitle(savedWorkTitle);
    
    // Load saved reminders
    const savedReminders = localStorage.getItem('reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    } else {
      // Set initial demo reminders
      const initialReminders = [
        { day: 'Monday', time: '08:00', message: 'Time to go to work!', workTitle: 'Office', id: 1 },
        { day: 'Tuesday', time: '08:00', message: 'Work day - don\'t forget your lunch!', workTitle: 'Office', id: 2 },
      ];
      setReminders(initialReminders);
      localStorage.setItem('reminders', JSON.stringify(initialReminders));
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workdays', JSON.stringify(workdays));
    localStorage.setItem('reminderTime', reminderTime);
    localStorage.setItem('isReminderActive', JSON.stringify(isReminderActive));
    localStorage.setItem('reminders', JSON.stringify(reminders));
    localStorage.setItem('dismissedReminders', JSON.stringify(dismissedReminders));
    localStorage.setItem('workTitle', workTitle);
  }, [workdays, reminderTime, isReminderActive, reminders, dismissedReminders, workTitle]);
  
  const toggleDay = (day) => {
    setWorkdays({
      ...workdays,
      [day]: !workdays[day]
    });
  };
  
  const handleWorkTitleChange = (e) => {
    setWorkTitle(e.target.value);
  };
  
  const handleTimeChange = (e) => {
    setReminderTime(e.target.value);
  };
  
  const toggleReminderActive = () => {
    setIsReminderActive(!isReminderActive);
  };
  
  const addReminder = () => {
    const days = Object.keys(workdays).filter(day => workdays[day]);
    
    if (days.length === 0) {
      alert('Please select at least one workday first.');
      return;
    }
    
    if (!workTitle.trim()) {
      alert('Please enter what work you need to be reminded of.');
      return;
    }
    
    const reminderMessage = `Time to go to ${workTitle}!`;
    
    const newReminders = days.map(day => ({
      day,
      time: reminderTime,
      message: reminderMessage,
      workTitle: workTitle,
      id: Date.now() + Math.random()
    }));
    
    setReminders([...reminders, ...newReminders]);
  };
  
  const deleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };
  
  const dismissReminder = (id) => {
    setDismissedReminders([...dismissedReminders, id]);
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Check if there's an active reminder now
  const activeReminder = reminders.find(reminder => {
    const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
    
    return reminder.day === today && 
           reminderHour === currentHour && 
           Math.abs(reminderMinute - currentMinute) < 5 &&
           isReminderActive &&
           !dismissedReminders.includes(reminder.id);
  });
  
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: colors.lightLavender }}>
      {/* Header */}
      <header className="p-4 text-center" style={{ backgroundColor: colors.darkLavender, color: 'white' }}>
        <h1 className="text-2xl font-bold">Work Reminder</h1>
      </header>
      
      {/* Current time and date */}
      <div className="p-4 text-center" style={{ backgroundColor: colors.lavender }}>
        <p className="text-lg">{formatDate(currentTime)}</p>
        <p className="text-xl font-bold">{formatTime(currentTime)}</p>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Active reminder alert */}
        {activeReminder && (
          <div className="mb-6 p-4 rounded-lg animate-pulse relative" style={{ backgroundColor: colors.darkSage, color: 'white' }}>
            <button 
              className="absolute top-2 right-2 p-1 w-6 h-6 flex items-center justify-center rounded-full text-white text-sm"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              onClick={() => dismissReminder(activeReminder.id)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold">⏰ Reminder!</h2>
            <p className="text-lg">{activeReminder.message}</p>
          </div>
        )}
        
        {/* Settings panel */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.lightSage }}>
          <h2 className="text-lg font-bold mb-2">Work Schedule</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(workdays).map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: workdays[day] ? colors.darkSage : colors.lightLavender,
                  color: workdays[day] ? 'white' : 'black',
                }}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm">What work:</label>
            <input
              type="text"
              value={workTitle}
              onChange={handleWorkTitleChange}
              placeholder="e.g., Office, Teaching, Hospital"
              className="px-2 py-1 rounded border flex-1"
              style={{ borderColor: colors.darkLavender }}
            />
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm">Reminder time:</label>
            <input
              type="time"
              value={reminderTime}
              onChange={handleTimeChange}
              className="px-2 py-1 rounded border"
              style={{ borderColor: colors.darkLavender }}
            />
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isReminderActive} 
                  onChange={toggleReminderActive} 
                />
                <div className="w-10 h-4 rounded-full bg-gray-300"></div>
                <div 
                  className={`absolute left-0 top-0 w-6 h-4 rounded-full transition ${isReminderActive ? 'transform translate-x-full' : ''}`}
                  style={{ backgroundColor: isReminderActive ? colors.darkSage : colors.lightLavender }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{isReminderActive ? 'Reminders active' : 'Reminders disabled'}</span>
            </label>
          </div>
          
          <button 
            onClick={addReminder}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: colors.darkLavender }}
          >
            Add Reminders
          </button>
        </div>
        
        {/* Reminders list */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'white' }}>
          <h2 className="text-lg font-bold mb-2">Your Reminders</h2>
          
          {reminders.length === 0 ? (
            <p className="text-gray-500">No reminders set. Add some above!</p>
          ) : (
            <div className="space-y-2">
              {reminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className="p-3 rounded-lg flex justify-between items-center"
                  style={{ backgroundColor: colors.lightLavender }}
                >
                  <div>
                    <p className="font-medium">{reminder.day} at {reminder.time}</p>
                    <p className="text-sm">{reminder.message}</p>
                  </div>
                  <button 
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-1 rounded-full text-white"
                    style={{ backgroundColor: colors.darkLavender }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="p-2 text-center text-sm" style={{ backgroundColor: colors.sage, color: 'white' }}>
        <p>Work Reminder App with Lavender & Sage Theme</p>
        <p className="mt-1">Made with love by Simon Doku</p>
      </footer>
    </div>
  );
};

export default WorkReminderApp;