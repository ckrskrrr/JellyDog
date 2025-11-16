interface FloatingAddButtonProps {
    onClick: () => void;
  }
  
  const FloatingAddButton = ({ onClick }: FloatingAddButtonProps) => {
    return (
      <button
        onClick={onClick}
        className="fixed bottom-8 right-8 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center text-3xl z-50"
        title="Add Product"
      >
        +
      </button>
    );
  };
  
  export default FloatingAddButton;