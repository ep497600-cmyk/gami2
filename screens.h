#ifndef SCREENS_H
#define SCREENS_H

#include <QWidget>
#include <QStackedWidget>
#include <QLabel>
#include <QPushButton>
#include <QVBoxLayout>
#include <QTimer>

// 1. Loading Screen
class LoadingScreen : public QWidget {
public:
    LoadingScreen(QWidget *parent = nullptr);
};

// 2. Login Screen
class LoginScreen : public QWidget {
public:
    LoginScreen(QWidget *parent = nullptr);
};

// 3. Manager (Jo screens badlega)
class GamiManager : public QStackedWidget {
    Q_OBJECT
public:
    GamiManager();
public slots:
    void goToLogin(); // Loading ke baad yahan aayenge
};

#endif