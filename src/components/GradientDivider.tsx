import gradientBreak from "@/assets/gradient-section-break.png";

const GradientDivider = () => {
  return (
    <div className="w-full h-8 md:h-12 relative overflow-hidden">
      <img 
        src={gradientBreak} 
        alt="" 
        className="w-full h-full object-cover"
        aria-hidden="true"
      />
    </div>
  );
};

export default GradientDivider;
