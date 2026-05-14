package com.hastakala.shop.data.local

import androidx.room.*
import com.hastakala.shop.data.model.Product
import com.hastakala.shop.data.model.Sale
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY createdAt DESC")
    fun getAllProducts(): Flow<List<Product>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product)

    @Update
    suspend fun updateProduct(product: Product)

    @Delete
    suspend fun deleteProduct(product: Product)
}

@Dao
interface SaleDao {
    @Query("SELECT * FROM sales WHERE isDeleted = 0 ORDER BY soldAt DESC")
    fun getAllSales(): Flow<List<Sale>>

    @Insert
    suspend fun insertSale(sale: Sale)

    @Update
    suspend fun updateSale(sale: Sale)

    @Query("SELECT SUM(totalPrice) FROM sales WHERE isDeleted = 0")
    fun getTotalIncome(): Flow<Double?>
}

@Database(entities = [Product::class, Sale::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun saleDao(): SaleDao
}
