package com.harasees.foodlabel.ui.imageViewerDlg

import android.util.Log
import android.view.View
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.window.DialogWindowProvider
import androidx.core.view.WindowCompat
import com.harasees.foodlabel.R
import me.saket.telephoto.zoomable.ZoomSpec
import me.saket.telephoto.zoomable.coil3.ZoomableAsyncImage
import me.saket.telephoto.zoomable.rememberZoomableImageState
import me.saket.telephoto.zoomable.rememberZoomableState
import java.io.File
import kotlin.collections.get
import kotlin.math.max

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImageViewerDlg(images : List<File>,
                   onDismiss : () -> Unit)
{
    var selectedImage by remember(images) { mutableStateOf(images.getOrNull(0)) }
    selectedImage?.let { selectedImage ->
        Dialog(onDismissRequest = onDismiss,
               properties = DialogProperties(usePlatformDefaultWidth = false,
                                             decorFitsSystemWindows = false)) {
            Column(Modifier.fillMaxSize().navigationBarsPadding()) {
                if (images.isNotEmpty())
                {
                    val pagerState = rememberPagerState(
                        pageCount = { images.size },
                        initialPage = max(0,
                                          images.indexOfFirst { it.absolutePath == selectedImage.absolutePath })
                    )

                    TopAppBar(
                        title = {
                            Text("${pagerState.currentPage + 1} of ${pagerState.pageCount}")
                        },
                        navigationIcon = {
                            IconButton(onClick = { onDismiss() }) {
                                Icon(
                                    painterResource(R.drawable.arrow_back),
                                    contentDescription = "Close")
                            }
                        }
                    )

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .background(Color.Black.copy(alpha = 0.95f))
                    ) {
                        HorizontalPager(
                            state = pagerState,
                            modifier = Modifier.fillMaxSize()
                        ) { page ->

                            ZoomableAsyncImage(
                                model = images[page],
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize())
                        }
                    }
                }
            }
        }
    }
}
