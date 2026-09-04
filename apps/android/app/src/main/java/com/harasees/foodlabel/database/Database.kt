package com.harasees.foodlabel.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.harasees.foodlabel.database.Entites.ClickedPicture
import com.harasees.foodlabel.database.Entites.ClickedPictureDao

@Database(
    entities = [ClickedPicture::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun getClickedPictureDao(): ClickedPictureDao
}