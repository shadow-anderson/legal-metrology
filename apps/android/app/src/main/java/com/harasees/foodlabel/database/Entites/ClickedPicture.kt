package com.harasees.foodlabel.database.Entites

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Entity
data class ClickedPicture(
        @PrimaryKey(autoGenerate = true)
        val id : Int = 0,
        val timeStamp : Long,
        val filePath : String
)

@Dao
interface ClickedPictureDao
{
    @Query("SELECT * FROM ClickedPicture")
    suspend fun getAllPictures() : List<ClickedPicture>

    @Query("SELECT * FROM ClickedPicture")
    fun getAllPicturesAsync() : Flow<List<ClickedPicture>>

    @Insert
    suspend fun insertPicture(picture : ClickedPicture)

    @Delete
    suspend fun deletePicture(picture : ClickedPicture)

    @Query("DELETE FROM ClickedPicture")
    suspend fun deleteAll()
}