package com.harasees.foodlabel.repositories

import android.content.Context
import com.harasees.foodlabel.database.Entites.ClickedPicture
import com.harasees.foodlabel.database.Entites.ClickedPictureDao
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ClickedPicsRepo @Inject constructor(@ApplicationContext private val context : Context,
                                          private val dao : ClickedPictureDao)
{
    val clickedPictures = dao.getAllPicturesAsync()

    suspend fun addClickedPicture(filePath : String)
    {
        dao.insertPicture(ClickedPicture(0, System.currentTimeMillis(),
                                         filePath))
    }

    suspend fun clearClickedPictures()
    {
        val pics = dao.getAllPictures()
        for(pic in pics)
            deleteImageFile(pic.filePath)
        dao.deleteAll()
    }

    suspend fun removeClickedPicture(picture : ClickedPicture)
    {
        deleteImageFile(picture.filePath)
        dao.deletePicture(picture)
    }

    private fun deleteImageFile(imagePath : String)
    {
        val file = File(imagePath)
        if(file.exists())
            file.delete()
    }

    suspend fun getAllPictures() : List<ClickedPicture>
    {
        return dao.getAllPictures()
    }
}