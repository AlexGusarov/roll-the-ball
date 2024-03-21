interface Sector {
    color: string;
  }
  
  interface SectorWithCommand extends Sector {
    command: string;
  }
  
  const createSectorCommands = (sectors: Sector[]): SectorWithCommand[] => {
    const sectorDegree = 360 / sectors.length;
    return sectors.map((sector, index): SectorWithCommand => {
      const startAngle = sectorDegree * index - 90;
      const endAngle = sectorDegree * (index + 1) - 90;
      const largeArcFlag = sectorDegree > 180 ? 1 : 0;
  
      // Calculate start and end points
      const startX = 100 + 100 * Math.cos(Math.PI * startAngle / 180);
      const startY = 100 + 100 * Math.sin(Math.PI * startAngle / 180);
      const endX = 100 + 100 * Math.cos(Math.PI * endAngle / 180);
      const endY = 100 + 100 * Math.sin(Math.PI * endAngle / 180);
  
      const command = `M100,100 L${startX},${startY} A100,100 0 ${largeArcFlag},1 ${endX},${endY} Z`;
      return { ...sector, command };
    });
  };
  

  export default createSectorCommands; 
  
