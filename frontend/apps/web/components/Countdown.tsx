import React, { useEffect, useState } from 'react';

const Countdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        // Countdown finished
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    updateCountdown(); 

    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  return (
   <div className="grid grid-cols-4 gap-4 mb-6">
  {[ 
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ].map((item, idx) => (
    <div
      key={idx}
      className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm"
    >
      <p className="text-2xl font-bold text-gray-900">{item.value.toString().padStart(2, '0')}</p>
      <p className="mt-1 text-xs font-semibold text-gray-500 uppercase">{item.label}</p>
    </div>
  ))}
</div>

  );
};

export default Countdown;
