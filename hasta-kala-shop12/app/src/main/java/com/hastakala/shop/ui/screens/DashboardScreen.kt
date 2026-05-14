package com.hastakala.shop.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.hastakala.shop.viewmodel.ShopViewModel

@Composable
fun DashboardScreen(viewModel: ShopViewModel) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        item {
            Text(
                text = "Vyaapaar Dashboard",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Income Cards
        item {
             Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                 IncomeCard("Weekly", "₹ 12,450", modifier = Modifier.weight(1f))
                 IncomeCard("Monthly", "₹ 48,200", modifier = Modifier.weight(1f))
             }
             Spacer(modifier = Modifier.height(24.dp))
        }

        // AI Suggestions Placeholder
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text("AI Business Insight", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Red bags are selling 25% faster than last week. Increase stock for the upcoming weekend flea market.", 
                        style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

@Composable
fun IncomeCard(label: String, amount: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            Text(amount, style = MaterialTheme.typography.titleLarge, color = Color.White)
        }
    }
}
