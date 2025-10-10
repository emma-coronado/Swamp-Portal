package com.swamp_portal.webapp.data_format;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ExpiringBuffer<T extends Timestamped> {
    private final List<T> items = new ArrayList<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    public void add(T item) {
        if (item == null)
            return;
        lock.writeLock().lock();
        try {
            items.add(item);
            items.sort(Comparator.comparing(Timestamped::getTimestamp));
            purge(Instant.now());
        } finally {
             lock.writeLock().unlock();
        }
    }

    public void addAll(Collection<T> newItems) {
        if (newItems == null || newItems.isEmpty())
            return;
        lock.writeLock().lock();
        try {
            items.addAll(newItems);
            items.sort(Comparator.comparing(Timestamped::getTimestamp));
            purge(Instant.now());
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void purge(Instant time) {
        if (items.isEmpty())
            return;

        if (items.getLast().getTimestamp().isBefore(time)) {
            T tmp = items.getLast();
            items.clear();
            items.add(tmp);
            return;
        }

        int dropped = 0;
        while ((items.size() - dropped) > 1 && items.get(dropped).getTimestamp().isBefore(time))
            dropped++;
        if (dropped > 0)
            items.subList(0, dropped).clear();
    }

    public List<T> snapshot() {
        lock.readLock().lock();
        try {
            return Collections.unmodifiableList(new ArrayList<>(items));
        } finally {
            lock.readLock().unlock();
        }
    }

    public Optional<T> peek() {
        lock.readLock().lock();
        try {
            return items.isEmpty() ? Optional.empty() : Optional.of(items.get(0));
        } finally {
            lock.readLock().unlock();
        }
    }

    public int size() {
        lock.readLock().lock();
        try {
            return items.size();
        } finally {
            lock.readLock().unlock();
        }
    }
}
