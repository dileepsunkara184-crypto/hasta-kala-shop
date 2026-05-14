package com.hastakala.shop.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.hastakala.shop.viewmodel.ShopViewModel

@Composable
fun IncomeScreen(viewModel: ShopViewModel) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Revenue Analysis", style = MaterialTheme.typography.headlineSmall, color = Color.White)
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text("Total Earnings", style = MaterialTheme.typography.labelMedium, color = Color.White.copy(alpha = 0.7f))
                    Text("₹ 84,250.00", style = MaterialTheme.typography.headlineLarge, color = Color.White)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.ArrowUpward, contentDescription = null, tint = Color.Green, modifier = Modifier.size(16.dp))
                        Text("+12% from last month", style = MaterialTheme.typography.bodySmall, color = Color.Green)
                    }
                }
            }
        }

        item {
            Text("Recent Transactions", style = MaterialTheme.typography.titleMedium)
        }

        item {
            TransactionItem("Hand-painted Jute Bag", "₹ 1,200", "2 mins ago")
        }
        item {
            TransactionItem("Terracotta Vase", "₹ 850", "1 hour ago")
        }
    }
}

@Composable
fun TransactionItem(name: String, price: String, time: String) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(name, style = MaterialTheme.typography.bodyLarge)
                Text(time, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            Text(price, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
        }
    }
}
