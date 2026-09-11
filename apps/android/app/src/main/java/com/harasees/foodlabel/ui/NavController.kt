package com.harasees.foodlabel.ui

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.serialization.Serializable
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NavController @Inject constructor()
{
    companion object
    {
        sealed class NavRoutes
        {
            @Serializable
            object CameraScreenRoute : NavRoutes()

            @Serializable
            object HomeScreenRoute : NavRoutes()

            object GoBack : NavRoutes()
        }
    }

    private val _systemPadding = MutableStateFlow(PaddingValues(0.dp))
    val systemPadding = _systemPadding.asStateFlow()

    private val _navChannel = Channel<NavRoutes>(Channel.UNLIMITED)
    val navChannel = _navChannel.receiveAsFlow()

    private val _imageViewerDlg = MutableStateFlow<List<File>?>(null)
    val imageViewerDlg = _imageViewerDlg.asStateFlow()

    fun setSystemPadding(padding : PaddingValues)
    {
        _systemPadding.value = padding
    }

    suspend fun navTo(route : NavRoutes)
    {
        _navChannel.send(route)
    }

    fun setImageViewerDlgVisibility(images : List<File>?)
    {
        _imageViewerDlg.value = images
    }
}