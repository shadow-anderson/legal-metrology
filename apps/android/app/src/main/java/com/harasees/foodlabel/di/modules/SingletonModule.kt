package com.harasees.foodlabel.di.modules

import android.content.Context
import androidx.room.Room
import com.harasees.foodlabel.database.AppDatabase
import com.harasees.foodlabel.database.Entites.ClickedPictureDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton


@Module
@InstallIn(SingletonComponent::class)
object SingletonModule
{

    @Provides
    @Singleton
    fun provideBlacklistDao(db : AppDatabase) : ClickedPictureDao
    {
        return db.getClickedPictureDao()
    }

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context : Context) : AppDatabase
    {
        return Room.databaseBuilder(context, AppDatabase::class.java, "foodlabel-database")
            .fallbackToDestructiveMigration(true) //TODO: Remember to remove this before production
            .build()
    }
}