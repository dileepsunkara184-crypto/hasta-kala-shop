package com.hastakala.shop.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hastakala.shop.data.model.Product
import com.hastakala.shop.data.model.Sale
import com.hastakala.shop.data.local.ProductDao
import com.hastakala.shop.data.local.SaleDao
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ShopViewModel(
    private val productDao: ProductDao,
    private val saleDao: SaleDao
) : ViewModel() {

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    private val _sales = MutableStateFlow<List<Sale>>(emptyList())
    val sales: StateFlow<List<Sale>> = _sales.asStateFlow()

    init {
        viewModelScope.launch {
            productDao.getAllProducts().collect { _products.value = it }
        }
        viewModelScope.launch {
            saleDao.getAllSales().collect { _sales.value = it }
        }
    }

    fun addProduct(product: Product) = viewModelScope.launch {
        productDao.insertProduct(product)
    }

    fun recordSale(sale: Sale) = viewModelScope.launch {
        saleDao.insertSale(sale)
        // Auto-update product stock logic would go here
    }
}
