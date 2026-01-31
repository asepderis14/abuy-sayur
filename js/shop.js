import { db } from './firebase-config.js';
import { collection, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('tokoCart')) || [];
let allMenus = [];

// Load Data
onSnapshot(collection(db, "menus"), (snapshot) => {
    allMenus = [];
    snapshot.forEach(doc => allMenus.push(doc.data()));
    render(allMenus);
});

function render(menus) {
    const list = document.getElementById('product-list');
    list.innerHTML = menus.map(item => `
        <div class="card">
            <img src="${item.image}">
            <div class="card-content">
                <h4>${item.name}</h4>
                <p>Rp ${item.price.toLocaleString('id-ID')}</p>
                <button onclick="addToCart('${item.name}', ${item.price})" style="width:100%">Tambah</button>
            </div>
        </div>`).join('');
}

// Search
document.getElementById('search-input').oninput = (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = allMenus.filter(m => m.name.toLowerCase().includes(keyword));
    render(filtered);
};

window.addToCart = (name, price) => {
    cart.push({name, price});
    updateUI();
};

window.toggleCart = () => {
    const m = document.getElementById('cart-modal');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
};

function updateUI() {
    localStorage.setItem('tokoCart', JSON.stringify(cart));
    document.getElementById('cart-count').innerText = `🛒 ${cart.length}`;
    const itemsDiv = document.getElementById('cart-items');
    itemsDiv.innerHTML = cart.map((item, i) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px">
            <span>${item.name}</span>
            <span>Rp ${item.price.toLocaleString()} <button onclick="remove(${i})" class="btn-danger" style="padding:2px 5px">x</button></span>
        </div>`).join('');
    
    if(cart.length > 0) itemsDiv.innerHTML += `<textarea id="note" placeholder="Catatan (misal: pedas, jangan layu)"></textarea>`;
    const total = cart.reduce((a, b) => a + b.price, 0);
    document.getElementById('cart-total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

window.remove = (i) => { cart.splice(i,1); updateUI(); };

window.checkout = async () => {
    if(!cart.length) return;
    const nama = prompt("Nama Anda:");
    if(!nama) return;
    const catatan = document.getElementById('note').value;
    
    await addDoc(collection(db, "orders"), {
        customerName: nama, items: cart, note: catatan,
        totalPrice: cart.reduce((a,b)=> a+b.price, 0),
        status: "Baru", createdAt: serverTimestamp()
    });
    alert("Pesanan dikirim!");
    cart = []; updateUI(); toggleCart();
};
updateUI();