import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import Pagination from '../common/Pagination';
import Spinner from '../common/Spinner';
import { useInventory } from '../../context/InventoryContext';

const InventoryList = () => {
  const {
    inventory,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    deleteInventoryItem
  } = useInventory();
  
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Other'];

  const handleSort = (field) => {
    const currentSort = filters.sort || '-createdAt';
    const currentField = currentSort.startsWith('-') ? currentSort.substring(1) : currentSort;
    const currentDirection = currentSort.startsWith('-') ? 'desc' : 'asc';
    
    let newSort;
    if (field === currentField) {
      newSort = currentDirection === 'asc' ? `-${field}` : field;
    } else {
      newSort = field;
    }
    
    setFilters({ sort: newSort });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setFilters({ limit: parseInt(e.target.value) });
  };

  const handleCategoryFilter = (category) => {
    const newCategory = category === filters.category ? '' : category;
    setFilters({ category: newCategory });
  };

  const getSortIndicator = (field) => {
    const currentSort = filters.sort || '-createdAt';
    const currentField = currentSort.startsWith('-') ? currentSort.substring(1) : currentSort;
    const currentDirection = currentSort.startsWith('-') ? 'desc' : 'asc';
    
    if (field === currentField) {
      return currentDirection === 'asc' ? '↑' : '↓';
    }
    return null;
  };

  if (loading && inventory.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Inventory Management</h1>
        <Link
          to="/inventory/add"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Item
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <form onSubmit={handleSearch} className="flex mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search inventory..."
              className="border rounded-l px-4 py-2 w-full md:w-64"
              value={searchInput}
              onChange={handleSearchInputChange}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
            >
              <FaSearch />
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 py-1 rounded text-sm ${
                  filters.category === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
            {filters.category && (
              <button
                onClick={() => handleCategoryFilter('')}
                className="px-3 py-1 rounded text-sm bg-red-500 text-white"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No inventory items found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {getSortIndicator('name') && (
                        <span className="ml-1">{getSortIndicator('name')}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      Category
                      {getSortIndicator('category') && (
                        <span className="ml-1">{getSortIndicator('category')}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity
                      {getSortIndicator('quantity') && (
                        <span className="ml-1">{getSortIndicator('quantity')}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      Price
                      {getSortIndicator('price') && (
                        <span className="ml-1">{getSortIndicator('price')}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.quantity}
                          {item.quantity <= item.minimumStockLevel && (
                            <span className="ml-2 text-xs text-red-500 font-bold">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${item.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/inventory/edit/${item._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => deleteInventoryItem(item._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-sm text-gray-700">
                  Showing {inventory.length} of {pagination.total} items
                </span>
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={pagination.limit}
                  onChange={handleItemsPerPageChange}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryList; 