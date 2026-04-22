import React, { useState, useRef, useEffect } from 'react';
import { Info, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: catData } = await supabase.from('categories').select('name');
      if (catData) {
        setCategories(["All", ...catData.map(c => c.name)]);
      }

      const { data: itemData } = await supabase
        .from('menu_items')
        .select(`
          id, name, price, description, image_url, is_featured,
          categories ( name ),
          menu_item_ingredients ( ingredients ( name ) )
        `);
      
      if (itemData) {
        const formattedData = itemData.map(item => ({
          id: item.id,
          name: item.name,
          category: item.categories?.name,
          price: item.price,
          description: item.description,
          ingredients: item.menu_item_ingredients?.map(mi => mi.ingredients?.name) || [],
          image: item.image_url,
          featured: item.is_featured
        }));
        setMenuItems(formattedData);
      }
    };
    
    fetchMenu();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="menu-section">
      <div className="section-header">
        <span className="subtitle">Exploration</span>
        <h2>Our <span>Menu</span></h2>
        <div className="search-container glass">
          <input 
            type="text" 
            placeholder="Search our flavors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-wrapper">
        {canScrollLeft && (
          <button 
            className="scroll-btn left" 
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        <div 
          className="filter-container"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button 
            className="scroll-btn right" 
            onClick={() => scroll('right')}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className="menu-grid">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`menu-card ${item.featured ? 'featured-card' : ''}`}
          >
            <div className="card-image">
              <img src={item.image} alt={item.name} />
              <div className="card-overlay" onClick={() => setSelectedItem(item)}>
                <Info size={24} />
              </div>
              {item.featured && <span className="featured-badge">Chef's Choice</span>}
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3>{item.name}</h3>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
              <p>{item.description}</p>
              <button className="details-btn" onClick={() => addToCart(item)}>
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div 
          className="modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="modal-content glass"
            onClick={e => e.stopPropagation()}
          >
            <button className="close-modal" onClick={() => setSelectedItem(null)}>&times;</button>
            <div className="modal-body">
              <div className="modal-img">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>
              <div className="modal-info">
                <span className="category-tag">{selectedItem.category}</span>
                <h2>{selectedItem.name}</h2>
                <p className="modal-desc">{selectedItem.description}</p>
                
                <div className="ingredients">
                  <h4>Ingredients</h4>
                  <div className="tags">
                    {selectedItem.ingredients.map(ing => (
                      <span key={ing} className="tag">{ing}</span>
                    ))}
                  </div>
                </div>
                
                <div className="modal-footer">
                  <span className="modal-price">${selectedItem.price.toFixed(2)}</span>
                  <button className="add-to-cart-modal" onClick={() => {
                    addToCart(selectedItem);
                    setSelectedItem(null);
                  }}>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .menu-section {
          padding: 100px 10%;
          background: var(--bg-light);
          position: relative;
        }

        .menu-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.3;
          background-image: radial-gradient(circle at 100% 150%, var(--bg-light) 24%, var(--wave-color) 25%, var(--wave-color) 28%, var(--bg-light) 29%, var(--bg-light) 36%, var(--wave-color) 36%, var(--wave-color) 40%, transparent 40%),
            radial-gradient(circle at 0 150%, var(--bg-light) 24%, var(--wave-color) 25%, var(--wave-color) 28%, var(--bg-light) 29%, var(--bg-light) 36%, var(--wave-color) 36%, var(--wave-color) 40%, transparent 40%);
          background-size: 60px 30px;
          z-index: 0;
        }

        .section-header, .filter-wrapper, .menu-grid {
          position: relative;
          z-index: 1;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .subtitle {
          color: var(--street-orange);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 10px;
        }

        .section-header h2 {
          font-size: 3.5rem;
          color: var(--street-black);
          font-family: var(--font-brush);
        }

        .section-header h2 span {
          color: var(--street-orange);
        }

        .search-container {
          max-width: 500px;
          margin: 30px auto 0;
          padding: 5px 10px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          background: white;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--glass-border);
        }

        .search-container input {
          width: 100%;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: var(--street-black);
          font-family: inherit;
          font-size: 1rem;
          outline: none;
        }

        .search-container input::placeholder {
          color: var(--muted-gray);
        }

        .filter-wrapper {
          position: relative;
          margin-bottom: 60px;
          padding: 10px 0;
          overflow: hidden;
        }

        .featured-card {
           border-color: var(--street-orange) !important;
           box-shadow: 0 15px 40px rgba(255, 107, 0, 0.15) !important;
        }

        .featured-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: var(--street-orange);
          color: white;
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          z-index: 5;
          box-shadow: 0 4px 10px rgba(255, 107, 0, 0.3);
        }

        .filter-wrapper::before {
          left: 0;
          background: linear-gradient(90deg, var(--bg-light) 10%, transparent 100%);
        }

        .filter-wrapper::after {
          right: 0;
          background: linear-gradient(-90deg, var(--bg-light) 10%, transparent 100%);
        }

        .scroll-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: white;
          color: var(--street-black);
          border: 1px solid var(--glass-border);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        
        .scroll-btn:hover {
          background: var(--street-orange);
          color: white;
          border-color: var(--street-orange);
          box-shadow: var(--shadow-md);
        }

        .scroll-btn.left {
          left: 10px;
        }

        .scroll-btn.right {
          right: 10px;
        }

        .filter-container {
          display: flex;
          gap: 15px;
          padding: 10px 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          justify-content: center;
        }

        .filter-btn {
          flex: 0 0 auto;
          padding: 10px 28px;
          border: 1px solid var(--glass-border);
          background: white;
          color: var(--muted-gray);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.85rem;
          transition: var(--transition);
          border-radius: 50px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: var(--shadow-sm);
        }

        .filter-btn:hover, .filter-btn.active {
          border-color: var(--street-orange);
          color: white;
          background: var(--street-orange);
          box-shadow: 0 4px 15px rgba(255, 107, 0, 0.2);
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 40px;
        }

        .menu-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }

        .menu-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(255, 107, 0, 0.2);
        }

        .card-image {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .menu-card:hover .card-image img {
          transform: scale(1.1);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 107, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          cursor: pointer;
          transition: var(--transition);
        }

        .card-image:hover .card-overlay {
          opacity: 1;
        }

        .card-info {
          padding: 25px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .card-header h3 {
          font-size: 1.4rem;
          color: var(--street-black);
          font-weight: 700;
        }

        .price {
          color: var(--street-orange);
          font-weight: 800;
          font-size: 1.2rem;
        }

        .card-info p {
          color: var(--muted-gray);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 25px;
          height: 45px;
          overflow: hidden;
        }

        .details-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px solid var(--street-orange);
          color: var(--street-orange);
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          transition: var(--transition);
        }

        .details-btn:hover {
          background: var(--street-orange);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 0, 0.2);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          background: white;
          width: 100%;
          max-width: 900px;
          border-radius: 30px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .close-modal {
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 2rem;
          color: var(--street-black);
          z-index: 10;
          opacity: 0.5;
          transition: var(--transition);
        }

        .close-modal:hover {
          opacity: 1;
          color: var(--street-orange);
        }

        .modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .modal-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          min-height: 500px;
        }

        .modal-info {
          padding: 60px 40px;
          background: white;
        }

        .category-tag {
          color: var(--street-orange);
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.75rem;
          margin-bottom: 12px;
          display: block;
        }

        .modal-info h2 {
          font-size: 3rem;
          margin-bottom: 20px;
          color: var(--street-black);
          font-family: var(--font-brush);
          line-height: 1.1;
        }

        .modal-desc {
          color: var(--muted-gray);
          line-height: 1.8;
          margin-bottom: 30px;
          font-size: 1.1rem;
        }

        .ingredients h4 {
          margin-bottom: 15px;
          color: var(--street-black);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 1px;
        }

        .tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .tag {
          background: var(--bg-light);
          padding: 8px 18px;
          border-radius: 50px;
          font-size: 0.85rem;
          color: var(--muted-gray);
          border: 1px solid var(--glass-border);
          font-weight: 600;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--glass-border);
          padding-top: 30px;
        }

        .modal-price {
           color: var(--street-orange);
          font-size: 2.5rem;
          font-weight: 800;
        }

        .add-to-cart-modal {
          background: var(--street-orange);
          color: white;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 700;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: var(--transition);
          box-shadow: 0 10px 20px rgba(255, 107, 0, 0.2);
        }

        .add-to-cart-modal:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(255, 107, 0, 0.3);
        }

        @media (max-width: 850px) {
          .modal-body {
            grid-template-columns: 1fr;
          }
          .modal-info {
            padding: 40px 30px;
          }
          .modal-img img {
            min-height: 300px;
          }
          .modal-info h2 {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Menu;
