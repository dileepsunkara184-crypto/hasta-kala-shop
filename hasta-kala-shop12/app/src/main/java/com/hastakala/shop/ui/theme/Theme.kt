package com.hastakala.shop.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val OrangePrimary = Color(0xFFF97316)
private val DarkBackground = Color(0xFF0A0A0A)
private val CardBackground = Color(0xFF171717)

private val DarkColorScheme = darkColorScheme(
    primary = OrangePrimary,
    secondary = Color(0xFFFB923C),
    background = DarkBackground,
    surface = CardBackground,
    onPrimary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White
)

@Composable
fun HastaKalaTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
