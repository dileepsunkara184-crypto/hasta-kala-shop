package com.hastakala.shop.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.hastakala.shop.viewmodel.ShopViewModel

@Composable
fun HistoryScreen(viewModel: ShopViewModel) {
    val sales by viewModel.sales.collectAsState()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Sales Logs", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(16.dp))

        if (sales.isEmpty()) {
            Text("No sales recorded yet.", style = MaterialTheme.typography.bodyMedium)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(sales) { sale ->
                    TransactionItem(sale.productName, "₹${sale.totalPrice}", "Qty: ${sale.quantity}")
                }
            }
        }
    }
}
