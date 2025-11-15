'use client';

export default function CartItem({ item, theme, onRemove }) {
  return (
    <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <img src={item.imageUrl || '/logo.svg'} alt={item.name} className="w-16 h-16 object-cover rounded" />
        <div>
          <h3 className={`font-medium ${theme.text}`}>{item.name}</h3>
          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
          <p className={`${theme.text}`}>NPR {item.price}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 self-end sm:self-center">
        <p className={`font-medium ${theme.text}`}>NPR {(item.price * item.quantity).toFixed(2)}</p>
        <button onClick={() => onRemove(item._id)} className="text-red-500 hover:text-red-700">Remove</button>
      </div>
    </div>
  );
}