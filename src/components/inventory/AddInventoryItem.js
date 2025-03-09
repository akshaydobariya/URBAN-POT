import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';

const AddInventoryItem = () => {
  const { addInventoryItem } = useInventory();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    price: '',
    supplier: '',
    minimumStockLevel: '0',
    location: '',
    tags: ''
  });
  
  const { name, description, category, quantity, price, supplier, minimumStockLevel, location, tags } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    // Convert string values to numbers
    const itemData = {
      ...formData,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      minimumStockLevel: parseInt(minimumStockLevel),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };
    
    const result = await addInventoryItem(itemData);
    
    if (result) {
      navigate('/inventory');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add Inventory Item</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={category}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={quantity}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={price}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={supplier}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Minimum Stock Level</label>
              <input
                type="number"
                name="minimumStockLevel"
                value={minimumStockLevel}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={tags}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={description}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryItem; 