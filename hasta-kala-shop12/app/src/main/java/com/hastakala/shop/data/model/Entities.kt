package com.hastakala.shop.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "products")
data class Product(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val quantity: Int,
    val price: Double,
    val imageUrl: String? = null,
    val category: String? = null,
    val vendorId: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "sales")
data class Sale(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val productId: String,
    val productName: String,
    val quantity: Int,
    val pricePerUnit: Double,
    val totalPrice: Double,
    val soldAt: Long = System.currentTimeMillis(),
    val vendorId: String,
    val isDeleted: Boolean = false
)
