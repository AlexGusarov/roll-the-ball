import React, { useEffect, useRef } from 'react';
import { sectors } from '../constants/sectors';
import createSectorCommands from '../utils/createSectorCommands';
import './ColorSelector.css';


  const ColorSelector: React.FC<{
    onChange: (color: string) => void,
    onClose: () => void,
  }> = ({ onChange, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    const sectorsWithCommands = createSectorCommands(sectors);

    const handleColorSelect = (color: string) => {
        onChange(color);
        onClose(); // Закрыть компонент после выбора цвета
      };

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            onClose(); // Если клик вне меню, вызываем функцию для закрытия
          }
        };
    
        // Добавляем обработчик события клика на уровне документа
        document.addEventListener('mousedown', handleClickOutside);
    
        // Удаляем обработчик при размонтировании компонента
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [onClose]);

   return (
    <div ref={menuRef}  className="color-selector">
      <svg viewBox="0 0 200 200" style={{ cursor: 'pointer' }}>
        {sectorsWithCommands.map((sector, index) => (
          <path
            key={index}
            d={sector.command}
            fill={sector.color}
            onClick={() => handleColorSelect(sector.color)}
          />
        ))}
      </svg>
      <button className="color-selector__close" onClick={onClose}>✖</button>
    </div>
  );
};

  
export default ColorSelector;
