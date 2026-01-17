'use client';

import Link from "next/link";
import Image from "next/image";

export default function CartItem({ item, theme, onRemove, onUpdateQty }) {
  return (
    <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <Image
          src={item.imageUrl || '/logo.svg'}
          alt={item.name}
          width={64}
          height={64}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h3 className={`font-medium ${theme.text}`}>{item.name}</h3>
          <div className={`flex items-center gap-2 text-sm ${theme.secondaryText}`}>
            <span>Qty:</span>
            <input
              type="number"
              min={1}
              max={item.stock ?? 99}
              value={item.quantity}
              onChange={(e) => onUpdateQty?.(item._id, parseInt(e.target.value || '1', 10))}
              className={`w-16 border rounded px-2 py-1 ${theme.inputBorder} bg-transparent ${theme.text}`}
            />
            {item.stock === 0 && <span className={`${theme.danger} ml-2`}>Out of stock</span>}
          </div>
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
