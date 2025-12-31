import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface WeekPickerModalProps {
  initialSelectedWeeks: string[];
  onSave: (weeks: string[]) => void;
  onClose: () => void;
}

interface DatePickerProps {
  initialDate: Date;
  onSave: (date: Date) => void;
  onClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ initialDate, onSave, onClose }) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSaveClick = () => {
    onSave(selectedDate);
    onClose();
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Modal title="Choisir la date de départ" onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={handlePrevMonth}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="secondary" size="sm" onClick={handleNextMonth}>
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected Date Display */}
        <div className="text-center p-3 bg-sanctus-blue/10 rounded-lg">
          <p className="text-sm text-gray-600">Date sélectionnée :</p>
          <p className="font-semibold text-sanctus-blue">{formatSelectedDate(selectedDate)}</p>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((date, index) => (
            <div key={index} className="p-1">
              {date ? (
                <button
                  onClick={() => handleDateClick(date)}
                  className={`w-full h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150
                    ${date.toDateString() === selectedDate.toDateString()
                      ? 'bg-sanctus-blue text-white hover:bg-blue-600 ring-2 ring-blue-300'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                    ${date < new Date() && date.toDateString() !== selectedDate.toDateString()
                      ? 'text-gray-400 cursor-not-allowed'
                      : ''
                    }
                  `}
                  disabled={date < new Date() && date.toDateString() !== selectedDate.toDateString()}
                >
                  {date.getDate()}
                </button>
              ) : (
                <div className="w-full h-10"></div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose} className="!bg-white !hover:bg-gray-50 !text-white !border !border-gray-300">Annuler</Button>
          <Button type="button" onClick={handleSaveClick}>Sélectionner cette date</Button>
        </div>
      </div>
    </Modal>
  );
};

export const WeekPickerModal: React.FC<WeekPickerModalProps> = ({ initialSelectedWeeks, onSave, onClose }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>(initialSelectedWeeks);

  // L'utilisation de 53 semaines couvre tous les cas d'années bissextiles et simplifie la logique.
  const WEEKS_IN_YEAR = 53;

  const handleWeekClick = (weekNumber: number) => {
    const weekString = `${currentYear}-W${String(weekNumber).padStart(2, '0')}`;
    setSelectedWeeks(prev =>
      prev.includes(weekString)
        ? prev.filter(w => w !== weekString)
        : [...prev, weekString].sort()
    );
  };
  
  const handleSelectAllWeeksForYear = (year: number) => {
    const weeksForYear = Array.from({ length: WEEKS_IN_YEAR }, (_, i) => {
        const weekNumber = i + 1;
        return `${year}-W${String(weekNumber).padStart(2, '0')}`;
    });

    setSelectedWeeks(prev => {
        const newSelectedWeeks = new Set([...prev, ...weeksForYear]);
        return Array.from(newSelectedWeeks).sort();
    });
  };

  const handleSaveClick = () => {
    onSave(selectedWeeks);
    onClose();
  };

  return (
    <Modal title="Gérer les indisponibilités" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Button variant="secondary" size="sm" onClick={() => setCurrentYear(y => y - 1)}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <span className="text-xl font-bold text-gray-900 w-20 text-center">{currentYear}</span>
          <Button variant="secondary" size="sm" onClick={() => setCurrentYear(y => y + 1)}>
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="border-b border-t border-gray-200 py-4">
          <p className="text-sm font-medium text-gray-700 mb-2 text-center">Sélection rapide</p>
          <div className="flex flex-col sm:flex-row gap-2">
              <Button className="w-full" size="sm" variant="secondary" onClick={() => handleSelectAllWeeksForYear(currentYear)}>
                  Toute l'année {currentYear}
              </Button>
              <Button className="w-full" size="sm" variant="secondary" onClick={() => handleSelectAllWeeksForYear(currentYear + 1)}>
                  Toute l'année {currentYear + 1}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto pr-2">
          {Array.from({ length: WEEKS_IN_YEAR }, (_, i) => i + 1).map(week => {
            const weekString = `${currentYear}-W${String(week).padStart(2, '0')}`;
            const isSelected = selectedWeeks.includes(weekString);
            return (
              <button
                key={week}
                onClick={() => handleWeekClick(week)}
                className={`flex items-center justify-center h-10 w-10 rounded-lg transition-colors duration-150 text-sm font-medium
                  ${isSelected
                    ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {week}
              </button>
            );
          })}
        </div>

         <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose} className="!bg-white !hover:bg-gray-50 !text-white !border !border-gray-300">Annuler</Button>
            <Button type="button" onClick={handleSaveClick}>Enregistrer</Button>
        </div>
      </div>
    </Modal>
  );
};
