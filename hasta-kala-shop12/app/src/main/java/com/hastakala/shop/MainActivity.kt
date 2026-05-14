package com.hastakala.shop

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.hastakala.shop.ui.components.BottomNavigationBar
import com.hastakala.shop.ui.screens.DashboardScreen
import com.hastakala.shop.ui.theme.HastaKalaTheme
import com.hastakala.shop.viewmodel.ShopViewModel
import androidx.room.Room
import com.hastakala.shop.data.local.AppDatabase

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Database and ViewModel (Simple dependency injection for this demo)
        val db = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java, "hastakala-db"
        ).build()
        
        val viewModel = ShopViewModel(db.productDao(), db.saleDao())

        setContent {
            HastaKalaTheme {
                val navController = rememberNavController()
                var isBottomBarVisible by remember { mutableStateOf(true) }

                Scaffold(
                    bottomBar = {
                        BottomNavigationBar(
                            navController = navController,
                            isVisible = isBottomBarVisible
                        )
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .pointerInput(Unit) {
                                detectTapGestures(
                                    onTap = {
                                        // Toggle visibility on tap as requested
                                        isBottomBarVisible = !isBottomBarVisible
                                    }
                                )
                            }
                    ) {
                        NavHost(
                            navController = navController,
                            startDestination = "home"
                        ) {
                            composable("home") { DashboardScreen(viewModel) }
                            composable("income") { IncomeScreen(viewModel) }
                            composable("record") { RecordScreen(viewModel) }
                            composable("history") { HistoryScreen(viewModel) }
                            composable("profile") { ProfileScreen() }
                        }
                    }
                }
            }
        }
    }
}

import com.hastakala.shop.ui.screens.IncomeScreen
import com.hastakala.shop.ui.screens.RecordScreen
import com.hastakala.shop.ui.screens.HistoryScreen
import com.hastakala.shop.ui.screens.ProfileScreen
